import { StatusCodes } from 'http-status-codes';
import config from '../../../../config';
import { Course } from '../course.model';
import { Enrollment } from './enrollment.model';
import Stripe from 'stripe';
import ApiError from '../../../../errors/ApiError';
import { Teacher } from '../../teacher/teacher.model';
import { Server } from 'socket.io';
import { NotificationService } from '../../notifications/notification.service';
import { USER_ROLES } from '../../../../enums/user';
import { Lecture } from '../lecture/lecture.model';

const stripe = new Stripe(config.stripe_secret_key!);

const createEnrollmentToDB = async (data: any, io: Server) => {
  const isExistCourse = await Course.findOne({ _id: data.courseID });

  if (!isExistCourse) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found');
  }
  const isClassFilled =
    isExistCourse.enrollmentsID.length >= isExistCourse.studentRange;
  if (isClassFilled) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'No More Student can enroll in this course'
    );
  }
  const teacher = await Teacher.findById(isExistCourse.teacherID);
  if (!teacher) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
  }
  const isExistTransaction = await stripe.paymentIntents.retrieve(
    data.transactionId
  );
  if (!isExistTransaction) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Transaction not found');
  }
  const isStudentEnrolled: any = await Enrollment.findOne({
    studentID: data.studentID,
    courseID: data.courseID,
    transactionId: data.transactionId,
  });
  if (isStudentEnrolled) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Student is already enrolled in this course'
    );
  }

  // Enroll the student in the course after successful payment
  const enrollmentData = {
    studentID: data.studentID,
    courseID: data.courseID,
    transactionId: data.transactionId,
  };

  const result = await Enrollment.create(enrollmentData);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Enrollment not recorded');
  }

  const updatedCourse = await Course.findOneAndUpdate(
    { _id: data.courseID },
    { $push: { enrollmentsID: result._id } },
    { new: true }
  );

  if (!updatedCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Enrollment update failed');
  }

  // Send notifications
  const teacherNotificationMessage = `A new student has enrolled in your course "${updatedCourse.name}".`;
  await NotificationService.sendNotificationToAllUsersOfARole(
    teacher._id.toString(),
    {
      sendTo: USER_ROLES.TEACHER,
      title: 'New Student Enrolled',
      description: teacherNotificationMessage,
      data: { courseID: updatedCourse._id },
    },
    io
  );
  const studentNotificationMessage = `You have successfully enrolled in the course "${updatedCourse.name}".`;
  await NotificationService.sendNotificationToDB(
    {
      sendTo: USER_ROLES.STUDENT,
      sendUserID: data.studentID,
      title: 'Enrollment Successful',
      description: studentNotificationMessage,
      data: { courseID: updatedCourse._id },
    },
    io
  );
  await Teacher.findOneAndUpdate(
    { _id: teacher._id },
    { $inc: { pendingEarnings: isExistCourse.price } },
    { new: true }
  );
  return result;
};

const payTeacherForEnrollment = async (enrollmentId: string) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Enrollment not found');
  }
  const course = await Course.findById(enrollment.courseID);
  if (!course) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found');
  }
  const teacher = await Teacher.findOne({ _id: course?.teacherID });
  if (!teacher) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
  }

  const teacherShare = Math.round(course.price * 0.8 * 100); // 80% to teacher, in cents

  try {
    const transfer = await stripe.transfers.create({
      amount: teacherShare,
      currency: 'usd',
      //@ts-ignore
      destination: teacher.accountInformation.stripeAccountId!,
      transfer_group: enrollment.transactionId,
    });

    if (!transfer) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to transfer funds to teacher'
      );
    }

    // Update teacher's earnings in the database
    await Teacher.findOneAndUpdate(
      { _id: course.teacherID },
      { $inc: { earnings: teacherShare / 100 } }, // Convert back to dollars
      { new: true }
    );

    // Update enrollment to mark that teacher has been paid
    await Enrollment.updateMany({ _id: enrollmentId }, { teacherPaid: true });

    return transfer;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to transfer funds to teacher'
    );
  }
};

const payTeacherForCourse = async (courseId: string, io: Server) => {
  const course = await Course.findById(courseId);
  if (course?.status === 'completed' || course?.status === 'delete') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course already completed');
  }
  if (!course) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found');
  }

  const enrollments = await Enrollment.find({ courseID: courseId });
  if (enrollments.length === 0) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No enrollments found for this course'
    );
  }

  const teacher = await Teacher.findById(course.teacherID);
  if (!teacher) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
  }

  const teacherShare = Math.round(Number(course.price) * 0.8 * 100);
  const transferAmount = teacherShare * enrollments.length;

  // Ensure minimum transfer amount of 1 cent
  if (transferAmount < 1) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Insufficient funds for transfer'
    );
  }

  const transfer = await stripe.transfers.create({
    amount: transferAmount,
    currency: 'usd',
    //@ts-ignore
    destination: teacher.accountInformation.stripeAccountId!,
    transfer_group: courseId,
  });
  await Lecture.updateMany(
    { courseID: course._id },
    { lectureStatus: 'complete' }
  );
  if (!transfer) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to transfer funds to teacher'
    );
  }
  await Teacher.findOneAndUpdate(
    { _id: course.teacherID },
    { $inc: { earnings: teacherShare / 100 } }, // Convert back to dollars
    { new: true }
  );

  await Course.findByIdAndUpdate(courseId, { status: 'completed' });
  await Enrollment.updateMany({ courseID: courseId }, { teacherPaid: true });
  const teacherNotificationMessage = `Your course "${course.name}" has been completed.`;
  await NotificationService.sendNotificationToDB(
    {
      sendTo: USER_ROLES.TEACHER,
      sendUserID: teacher._id.toString(),
      title: 'Course Completed',
      description: teacherNotificationMessage,
    },
    io
  );
  const studentNotificationMessage = `Your course "${course.name}" has been completed. Let us know your feedback.`;
  Promise.all(
    enrollments.map(async enrollment => {
      await NotificationService.sendNotificationToDB(
        {
          sendTo: USER_ROLES.STUDENT,
          sendUserID: `${enrollment.studentID}`,
          title: 'Course Completed',
          description: studentNotificationMessage,
        },
        io
      );
    })
  );
  return transfer;
};

const createPaymentIntent = async (courseId: string) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found');
  }

  try {
    const paymentIntent: Stripe.PaymentIntent =
      await stripe.paymentIntents.create({
        amount: course.price * 100, // convert to cents
        currency: 'usd',
        metadata: {
          courseId: courseId,
        },
      });

    return {
      client_secret: paymentIntent.client_secret,
      transactionId: paymentIntent.id,
    };
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create payment intent'
    );
  }
};
const isEnrolled = async (studentID: string, courseID: string) => {
  const enrollment = await Enrollment.findOne({
    studentID: studentID,
    courseID: courseID,
  });
  if (!enrollment) {
    return false;
  }
  return true;
};
export const EnrollmentService = {
  createEnrollmentToDB,
  createPaymentIntent,
  payTeacherForEnrollment,
  payTeacherForCourse,
  isEnrolled,
};
