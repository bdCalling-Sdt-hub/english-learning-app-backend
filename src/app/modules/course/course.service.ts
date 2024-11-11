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
  if (data.lectures.length > 0) {
    lectures = data.lectures;
    delete data.lectures;
  }
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }
  if (isTeacherDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher deleted!');
  }

  // Parse and format time
  const time = JSON.parse(data.time);
  data.time = {
    start: new Date(time.start),
    end: new Date(time.end),
  };
  data.price = Number(data.price);
  data.studentRange = Number(data.studentRange);
  data.time.start = data.time.start.toString();
  data.time.end = data.time.end.toString();
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
    await NotificationService.sendNotificationToAllUserOfARole(
      notificationMessage,
      io,
      USER_ROLES.STUDENT
    );
    const adminNotificationMessage: string = `A new course "${result.name}" has been added by ${isExistTeacher?.name}`;
    await NotificationService.sendNotificationToAllUserOfARole(
      adminNotificationMessage,
      io,
      USER_ROLES.ADMIN,
      {
        data: { courseID: result._id, teacherID: isExistTeacher._id },
      }
    );
  }
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
      const totalLectures = await Lecture.countDocuments({
        courseID: course._id,
      });
      return {
        ...courseObj,
        startDate: courseObj.startDate,
        teacherName: teacher?.name,
        totalLectures,
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

const getCourseDetailsByIdFromDB = async (
  id: string
): Promise<Partial<ICourse | null>> => {
  let result: any = await Course.findOne({ _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }
  const teacher = await Teacher.findOne({ _id: result.teacherID });
  if (!teacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }
  const allLectures = await Lecture.find({ courseID: id });
  const newlectures: Array<any> = await Promise.all(
    allLectures.map(async (lecture: any) => ({
      _id: lecture._id,
      title: lecture.title,
      link: lecture.link ? lecture.link : null,
      linkStatus: await getLectureLinkStatus(lecture._id),
      date: dayjs(lecture.date).format('DD-MM-YYYY'),
      time: dayjs(lecture.time).format('hh:mm A'),
      status: lecture.lectureStatus,
      courseID: lecture.courseID,
    }))
  );
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
  const finalResult = {
    ...result._doc,
    time: {
      start: `${result.time.start} `,
      end: `${result.time.end}`,
    },
    completedLectures: totalDeprecatedLectures.length,
    enrolledStudents: allEnrolledStudents,
    teacher: {
      id: teacher._id,
      name: teacher.name,
      profile: teacher.profile,
    },
    reviews: reviewsWithStudentInfo,
    totalEnrolledStudents,
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

        teacherName: teacher?.name,
        totalLectures,
      };
    })
  );
  return finalResult;
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
  // deleteCourseFromDB,
};
