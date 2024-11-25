import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import { IReviews, ReviewsModel } from './reviews.interface';
import ApiError from '../../../errors/ApiError';
import { Student } from '../student/student.model';
import { Course } from '../course/course.model';

const reviewSchema = new Schema<IReviews, ReviewsModel>(
  {
    star: {
      type: Number,
      required: [true, 'Star is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    courseID: {
      type: String,
      required: [true, 'courseID is required'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'teacher is required'],
    },
    studentID: {
      type: String,
      required: [true, 'studentID is required'],
    },
  },
  { timestamps: true }
);

reviewSchema.pre('save', async function (next) {
  const isExistCourse = await Course.findOne({ _id: this.courseID });
  if (!isExistCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }

  const isExistStudent = await Student.findOne({ _id: this.studentID });
  if (!isExistStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student not found!');
  }
  if (isExistCourse.enrollmentsID.includes(this.studentID)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You didn't enroll in this course!"
    );
  }

  next();
});

export const Reviews = model<IReviews, ReviewsModel>('Reviews', reviewSchema);
