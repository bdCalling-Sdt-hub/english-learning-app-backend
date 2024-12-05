import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import { EnrollmentModel, IEnrollment } from './enrollment.interface';
import ApiError from '../../../../errors/ApiError';
import { Student } from '../../student/student.model';
import { Course } from '../course.model';

const enrollmentSchema = new Schema<IEnrollment, EnrollmentModel>(
  {
    studentID: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    courseID: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teacherID: {
      type: String,
      required: false,
    },
    teacherPaid: {
      type: Boolean,
      default: false,
      required: false,
    },

    // courseCompleted: {
    //   type: Boolean,
    //   default: false,
    //   required: false,
    // },
    transactionId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

enrollmentSchema.pre('save', async function (next) {
  const isExistCourse = await Course.findOne({ _id: this.courseID });
  if (!isExistCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Course not found!');
  }
  this.teacherID = isExistCourse.teacherID;
  const isExistStudent = await Student.findOne({ _id: this.studentID });
  if (!isExistStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student not found!');
  }
  next();
});

export const Enrollment = model<IEnrollment, EnrollmentModel>(
  'Enrollment',
  enrollmentSchema
);
