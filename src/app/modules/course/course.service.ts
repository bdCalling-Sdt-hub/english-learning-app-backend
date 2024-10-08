import { StatusCodes } from 'http-status-codes';
import { ICourse } from './course.interface';
import { Course } from './course.model';
import ApiError from '../../../errors/ApiError';
import { Teacher } from '../teacher/teacher.model';
import { status } from '../../../enums/user';
import { Lecture } from './lecture/lecture.model';
import { CourseValidation } from './course.validation';
import { ILecture } from './lecture/lecture.interface';
import Stripe from 'stripe';
import config from '../../../config';
// without stripe
// const createCourseToDB = async (data: any): Promise<Partial<ICourse>> => {
//   const isExistTeacher = await Teacher.findOne({ _id: data.teacherID });
//   const isTeacherDeleted = isExistTeacher?.status === status.delete;
//   let lectures;
//   if (data.lectures.length > 0) {
//     lectures = data.lectures;
//     delete data.lectures;
//   }
//   if (!isExistTeacher) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
//   }
//   if (isTeacherDeleted) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher deleted!');
//   }
//   const time = JSON.parse(data.time);
//   data.time = {
//     start: new Date(time.start),
//     end: new Date(time.end),
//   };
//   data.price = Number(data.price);
//   data.studentRange = Number(data.studentRange);
//   data.time.start = data.time.start.toString();
//   data.time.end = data.time.end.toString();

//   const validateData = {
//     body: {
//       ...data,
//     },
//   };
//   await CourseValidation.createCourseZodSchema.parseAsync(validateData);
//   const result = await Course.create(data);
//   if (!result) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not created!');
//   }
//   if (lectures) {
//     const jsonLectures = JSON.parse(lectures);
//     if (!Array.isArray(jsonLectures)) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         'Lectures must be an array of lectures!'
//       );
//     }
//     for (const lecture of jsonLectures) {
//       const resultLecture = await Lecture.create({
//         ...lecture,
//         courseID: result._id,
//       });
//       if (!resultLecture) {
//         throw new ApiError(StatusCodes.BAD_REQUEST, 'Lecture not created!');
//       }
//       await Course.findByIdAndUpdate(result._id, {
//         $push: {
//           lectures: resultLecture._id,
//         },
//       });
//     }
//   } else {
//     await Course.findByIdAndUpdate(result._id, {
//       $push: {
//         lectures: [],
//       },
//     });
//   }
//   return result;
// };

// with stripe

const createCourseToDB = async (data: any): Promise<Partial<ICourse>> => {
  // Validate the teacher's existence
  const isExistTeacher = await Teacher.findOne({ _id: data.teacherID });
  // @ts-ignore
  const isTeacherDeleted = isExistTeacher?.status === status.delete;
  let lectures;
  const stripe = new Stripe(config.stripe_secret_key!);

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

const getAllCoursesFromDB = async (): Promise<Partial<ICourse>[]> => {
  const result = await Course.find();
  return result;
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
  id: string
): Promise<Partial<Array<ICourse> | null>> => {
  const isExistTeacher = await Teacher.findOne({ _id: id });
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }
  // @ts-ignore
  if (isExistTeacher.status === status.delete) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher deleted!');
  }
  const result = await Course.find({
    teacherID: id,
    status: { $ne: status.delete },
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }

  return result;
};

const getLecturesOfCourseFromDB = async (
  id: string
): Promise<Partial<Array<ILecture> | null>> => {
  const existCourse = await Course.findOne({ _id: id });
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

const deleteCourseFromDB = async (id: string): Promise<Partial<ICourse>> => {
  const existCourse = await Course.findOne({ _id: id });
  if (existCourse?.status === status.delete) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course deleted!');
  }
  if (!existCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }
  const result = await Course.findByIdAndUpdate(id, {
    status: status.delete,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not deleted!');
  }
  return result;
};

export const CourseService = {
  createCourseToDB,
  getCourseByTeacherIdFromDB,
  getAllCoursesFromDB,
  getCourseByIdFromDB,
  updateCourseToDB,
  getLecturesOfCourseFromDB,
  deleteCourseFromDB,
};
