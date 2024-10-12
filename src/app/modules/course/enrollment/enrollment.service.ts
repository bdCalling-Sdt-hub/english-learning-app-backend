import { StatusCodes } from 'http-status-codes';
import config from '../../../../config';
import { Course } from '../course.model';
import { Enrollment } from './enrollment.model';
import Stripe from 'stripe';
import ApiError from '../../../../errors/ApiError';
import { Teacher } from '../../teacher/teacher.model';

const stripe = new Stripe(config.stripe_secret_key!);

const createEnrollmentToDB = async (data: any) => {
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
  const isStudentEnrolled = await Enrollment.findOne({
    studentID: data.studentID,
    courseID: data.courseID,
  });
  if (isStudentEnrolled) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Student is already enrolled in this course'
    );
  }
  let paymentIntent;

  try {
    // Step 1: Charge the student to add funds to platform's available balance
    const platformCharge = await stripe.charges.create({
      amount: isExistCourse.price * 100, // amount in cents
      currency: 'usd',
      source: 'tok_bypassPending', // Use Stripe's test token for bypassing pending state
      description: `Payment for course ${isExistCourse.name}`,
    });

    // Step 2: Create payment intent for student (simulating student paying)
    paymentIntent = await stripe.paymentIntents.create({
      amount: isExistCourse.price * 100, // amount in cents
      currency: 'usd',
      payment_method: data.paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Disable redirect-based payments
      },
      metadata: {
        courseID: data.courseID,
        studentID: data.studentID,
      },
    });
  } catch (error) {
    console.error(error);
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment failed');
  }

  // Step 3: Enroll the student in the course after successful payment
  const enrollmentData = {
    studentID: data.studentID,
    courseID: data.courseID,
    paymentIntentId: paymentIntent.id,
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

  const teacherShare = isExistCourse.price * 0.8 * 100;

  try {
    const giveTeacherShare = await stripe.transfers.create({
      amount: teacherShare,
      currency: 'usd',
      destination: teacher?.accountInformation.stripeAccountId!,
      transfer_group: paymentIntent.id,
    });
    if (!giveTeacherShare) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to transfer funds to teacher'
      );
    }
    await Teacher.findOneAndUpdate(
      { _id: isExistCourse.teacherID },
      { $inc: { earnings: teacherShare / 100 } },
      { new: true }
    );
  } catch (error) {
    console.error('Transfer failed:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to transfer funds to teacher'
    );
  }

  return result;
};

export const EnrollmentService = {
  createEnrollmentToDB,
};
