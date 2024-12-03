import { StatusCodes } from 'http-status-codes';
import { ICourse } from './course.interface';
import { Course } from './course.model';
import ApiError from '../../../errors/ApiError';
import { Teacher } from '../teacher/teacher.model';
import { status, USER_ROLES } from '../../../enums/user';
import { Lecture } from './lecture/lecture.model';
import { CourseValidation } from './course.validation';
import { ILecture } from './lecture/lecture.interface';
import Stripe from 'stripe';
import config from '../../../config';
import { isTeacherTransfersActive } from '../../../helpers/isTeacherTransfersActive';
import { LANGUAGE } from '../../../enums/language';
import { NotificationService } from '../notifications/notification.service';
import { Server } from 'socket.io';
import { Enrollment } from './enrollment/enrollment.model';
import { EnrollmentService } from './enrollment/enrollment.service';
import getLectureLinkStatus, {
  LectureLinkStatus,
} from '../../../shared/getLectureLinkStatus';
import { Student } from '../student/student.model';
import { Reviews } from '../reviews/reviews.model';
import { Types } from 'mongoose';
import dayjs from 'dayjs';

// with stripe
const stripe = new Stripe(config.stripe_secret_key!, {
  apiVersion: '2024-09-30.acacia',
});

const createCourseToDB = async (
  data: any,
  io: Server,
  id: string
): Promise<Partial<ICourse>> => {
  // Validate the teacher's existence
  data.teacherID = id;
  const isExistTeacher: any = await Teacher.findOne({ _id: data.teacherID });

  // @ts-ignore
  const isTeacherDeleted = isExistTeacher?.status === status.delete;
  let lectures;
  const stripe = new Stripe(config.stripe_secret_key!);
  const isPaymentSetup = await isExistTeacher?.accountInformation
    .stripeAccountId;
  if (!isPaymentSetup || isPaymentSetup === null) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment not setup');
  }
  // Handle lectures if they exist
  if (data.lectures && data.lectures.length > 0) {
    lectures = data.lectures;
    delete data.lectures;
  }
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }
  if (isTeacherDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher deleted!');
  }

  data.price = Number(data.price);
  data.studentRange = Number(data.studentRange);
  data.type = isExistTeacher?.type;
  // Validate the course data
  const validateData = {
    body: {
      ...data,
    },
  };
  await CourseValidation.createCourseZodSchema.parseAsync(validateData);

  // Create the course in the database
  const result = await Course.create(data);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not created!');
  }

  // Create a product in Stripe
  let stripeProduct;
  try {
    stripeProduct = await stripe.products.create({
      name: data.name,
      description: data.details,
      metadata: {
        courseId: result._id.toString(),
      },
    });

    await stripe.prices.create({
      unit_amount: data.price * 100,
      currency: 'usd',
      product: stripeProduct.id,
    });
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Stripe product creation failed!'
    );
  }

  // Handle lectures creation if they exist
  if (lectures) {
    const jsonLectures = JSON.parse(lectures);
    if (!Array.isArray(jsonLectures)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Lectures must be an array of lectures!'
      );
    }
    for (const lecture of jsonLectures) {
      const resultLecture = await Lecture.create({
        ...lecture,
        courseID: result._id,
      });
      if (!resultLecture) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Lecture not created!');
      }
      await Course.findByIdAndUpdate(result._id, {
        $push: {
          lectures: resultLecture._id,
        },
      });
    }
  } else {
    await Course.findByIdAndUpdate(result._id, {
      $push: {
        lectures: [],
      },
    });
  }
  if (isExistTeacher.type === 'platform') {
    const notificationMessage: string = `A new course "${result.name}" has been added by ${isExistTeacher?.name}`;
    await NotificationService.sendNotificationToAllUsersOfARole(
      USER_ROLES.STUDENT,
      {
        sendTo: USER_ROLES.STUDENT,
        title: 'New Course Added',
        description: `A new course "${result.name}" has been added by ${isExistTeacher?.name}`,
        data: { courseID: result._id, teacherID: isExistTeacher._id },
      },
      io
    );
  }
  const adminNotificationMessage: string = `A new course "${result.name}" has been added by ${isExistTeacher?.name} please check if it can be approved or not`;
  await NotificationService.sendNotificationToAllUsersOfARole(
    USER_ROLES.ADMIN,
    {
      sendTo: USER_ROLES.ADMIN,
      title: 'New Course Added',
      description: adminNotificationMessage,
      data: { courseID: result._id, teacherID: isExistTeacher._id },
    },
    io
  );
  return result;
};

const updateCourseToDB = async (
  id: string,
  data: Partial<ICourse>
): Promise<Partial<ICourse>> => {
  const isExistCourse = await Course.findOne({ _id: id });
  if (!isExistCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }
  const result = await Course.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not updated!');
  }
  return result;
};

const getAllCoursesFromDB = async (): Promise<Partial<any>[]> => {
  // Get all non-deleted courses
  const courses = await Course.find({ status: { $ne: 'delete' } });

  // Use Promise.all to wait for all teacher lookups to complete
  const finalResult = await Promise.all(
    courses.map(async (course: any) => {
      const teacher = await Teacher.findOne({ _id: course.teacherID });
      // Convert mongoose document to plain object before spreading
      const courseObj = course.toObject();
      const teacherObj = teacher ? teacher.toObject() : null;
      const totalLectures = await Lecture.find({
        courseID: course._id,
      });
      return {
        ...courseObj,
        startDate: courseObj.startDate,
        teacherName: teacher?.name,
        totalLectures: course?.lectures?.length,
      };
    })
  );

  return finalResult;
};

const getCourseByIdFromDB = async (
  id: string
): Promise<Partial<ICourse | null>> => {
  const result = await Course.findOne({ _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }
  if (result.status === status.delete) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course deleted!');
  }

  return result;
};

const getCourseByTeacherIdFromDB = async (
  id: string,
  queryParams: Record<string, unknown> = {}
): Promise<ICourse[]> => {
  console.log(id);
  const courses = await Course.find({
    teacherID: id,
    ...queryParams,
  });

  return courses;
};
const getLecturesOfCourseFromDB = async (
  id: string
): Promise<Partial<Array<ILecture> | null>> => {
  const existCourse: any = await Course.findOne({ _id: id });
  if (existCourse?.status === status.delete) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course deleted!');
  }
  if (!existCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }
  const result = await Lecture.find({ courseID: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }

  return result;
};

// const deleteCourseFromDB = async (id: string): Promise<Partial<ICourse>> => {
//   const existCourse = await Course.findOne({ _id: id });
//   if (existCourse?.status === status.delete) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Course deleted!');
//   }
//   if (!existCourse) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
//   }
//   const result = await Course.findByIdAndUpdate(id, {
//     status: status.delete,
//   });
//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not deleted!');
//   }
//   return result;
// };

const getCourseByLanguageFromDB = async (
  language: string
): Promise<Partial<Array<ICourse> | null>> => {
  if (
    language !== LANGUAGE.ENGLISH &&
    language !== LANGUAGE.HEBREW &&
    language !== LANGUAGE.SPANISH
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Language can only be either ENGLISH, HEBREW or SPANISH!'
    );
  }
  language = language.toUpperCase();
  const result = await Course.find({ language });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }
  return result;
};

const getCourseDetailsByIdFromDB = async (id: string): Promise<any> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid course ID format');
  }

  const result = await Course.findOne({ _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }

  const teacher = await Teacher.findOne({ _id: result.teacherID });
  if (!teacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }

  // Get all lectures and process them
  const allLectures = await Lecture.find({ courseID: id });
  const newlectures = await Promise.all(
    allLectures.map(async (lecture: any) => ({
      _id: lecture._id,
      title: lecture.title,
      link: lecture.link ? lecture.link : null,
      linkStatus: await getLectureLinkStatus(lecture._id),
      date: dayjs(lecture.date).format('DD-MM-YYYY'),
      time: dayjs(lecture.time).format('hh:mm A'),
      lectureStatus: lecture.lectureStatus,
      courseID: lecture.courseID,
    }))
  );

  // Get enrollments and students
  const enrollments = await Enrollment.find({ courseID: id });
  const allEnrolledStudents = await Promise.all(
    enrollments.map(async (enrollment: any) => {
      return await Student.findById(enrollment.studentID).select(
        'name profile _id'
      );
    })
  );

  const totalEnrolledStudents = enrollments.length;
  const totalDeprecatedLectures = newlectures.filter(
    (lecture: any) => lecture.linkStatus === LectureLinkStatus.DEPRECATED
  );

  // Get and process reviews
  const reviews = await Reviews.find({ courseID: id });
  const reviewsWithStudentInfo = await Promise.all(
    reviews.map(async (review: any) => {
      const student = await Student.findById(review.studentID).select(
        'name profile _id'
      );

      return {
        ...review._doc,
        date: dayjs(review.createdAt).format('DD-MM-YYYY'),
        name: student?.name || 'Anonymous',
        studentID: student?._id || null,
        profile: student?.profile || null,
      };
    })
  );

  // Calculate average review
  const totalTeacherReviews = await Reviews.find({ teacher: teacher._id });
  const avarageReview = totalTeacherReviews.reduce(
    (acc: number, review: any) => acc + review.star,
    0
  );

  const finalResult = {
    //@ts-ignore
    ...result._doc,
    time: {
      start: `${result.startTime} `, // Note the space after startTime
      end: `${result.endTime}`,
    },
    completedLectures: totalDeprecatedLectures.length,
    enrolledStudents: allEnrolledStudents,
    teacher: {
      id: teacher._id,
      name: teacher.name,
      profile: teacher.profile,
    },
    phoneNumber: teacher.phone,
    reviews: reviewsWithStudentInfo,
    totalEnrolledStudents,
    totalReviews: reviews.length,
    avarageRating: avarageReview / reviews.length, // Kept the original spelling 'avarage'
    lectures: newlectures,
  };

  return finalResult;
};

const getMyCoursesByStatusFromDB = async (userid: any, status: string) => {
  const courses = await Course.find({
    teacherID: userid,
    status: status,
  });
  const finalResult = await Promise.all(
    courses.map(async (course: any) => {
      const teacher = await Teacher.findOne({ _id: course.teacherID });
      const courseObj = course.toObject();
      const totalLectures = await Lecture.countDocuments({
        courseID: course._id,
      });
      return {
        ...courseObj,
        phoneNumber: teacher?.phone,
        teacherName: teacher?.name,
        totalLectures,
      };
    })
  );
  return finalResult;
};

const getEnrolledCourses = async (id: string) => {
  // Verify student exists
  const isExistStudent = await Student.findOne({ _id: id });
  if (!isExistStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student not found!');
  }

  // Get enrollments with populated courseID
  const enrollments = await Enrollment.find({ studentID: id }).populate({
    path: 'courseID',
  });

  // Map and resolve all course data
  const allCourses = await Promise.all(
    enrollments.map(async (enrollment: any) => {
      const courseObj = await Course.findById(enrollment.courseID._id);
      // @ts-ignore
      const teacher = await Teacher.findOne({ _id: courseObj.teacherID });

      const totalLectures = await Lecture.find({
        courseID: enrollment.courseID._id,
      });

      return {
        // @ts-ignore
        ...courseObj.toObject(),
        // @ts-ignore
        startDate: courseObj.startDate,
        teacherName: teacher?.name,
        totalLectures: courseObj?.lectures?.length,
      };
    })
  );

  return allCourses;
};
const approveCourseFromDB = async (id: string) => {
  const result = await Course.findOneAndUpdate(
    { _id: id },
    { status: 'active', isApproved: true },
    { new: true }
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }
  return result;
};
export const CourseService = {
  createCourseToDB,
  getCourseByTeacherIdFromDB,
  getAllCoursesFromDB,
  getCourseByIdFromDB,
  getCourseDetailsByIdFromDB,
  updateCourseToDB,
  getLecturesOfCourseFromDB,
  getCourseByLanguageFromDB,
  getMyCoursesByStatusFromDB,
  approveCourseFromDB,
  getEnrolledCourses,
  // deleteCourseFromDB,
};
