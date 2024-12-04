import { Course } from '../course/course.model';
import { Student } from '../student/student.model';
import { Reviews } from './reviews.model';

const createReviewsToDB = async (data: any) => {
  data.star = Number(data.star);
  const isExistCourse = await Course.findOne({ _id: data.courseID });
  if (!isExistCourse) {
    throw new Error('Course not found');
  }
  const isExistReview = await Reviews.findOne({
    courseID: data.courseID,
    studentID: data.studentID,
  });
  if (isExistReview) {
    throw new Error('Review already exist');
  }
  const result = await Reviews.create({
    ...data,
    teacher: isExistCourse.teacherID,
  });

  if (!result) {
    throw new Error('Reviews not created');
  }
  return result;
};

const getAllReviewsFromDB = async (id: string) => {
  const existCourse = await Course.findOne({ _id: id });
  if (!existCourse) {
    throw new Error('Course not found');
  }
  const reviews = await Reviews.find({ courseID: id });
  if (!reviews) {
    throw new Error('Reviews not found');
  }

  return reviews;
};

const getSingleReviewFromDB = async (id: string) => {
  const review = await Reviews.findOne({ _id: id });
  if (!review) {
    throw new Error('Review not found');
  }

  return review;
};

const getStudentReviewsFromDB = async (id: string) => {
  const existStudent = await Student.findOne({
    _id: id,
    status: { $ne: 'delete' },
  });
  if (!existStudent) {
    throw new Error('Student not found');
  }
  const reviews = await Reviews.find({ studentID: id });
  if (!reviews) {
    throw new Error('Reviews not found');
  }

  return reviews;
};

export const reviewsService = {
  createReviewsToDB,
  getAllReviewsFromDB,
  getSingleReviewFromDB,
  getStudentReviewsFromDB,
};
