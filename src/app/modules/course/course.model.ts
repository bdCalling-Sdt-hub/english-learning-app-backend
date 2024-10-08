import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, ObjectId, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { CourseModel, ICourse } from './course.interface';
import { Teacher } from '../teacher/teacher.model';

const courseSchema = new Schema<ICourse, CourseModel>(
  {
    name: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['platform', 'freelancer'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    studentRange: {
      type: Number,
      required: true,
    },
    teacherID: {
      type: String,
      required: true,
    },
    enrollmentsID: {
      type: [String],
      required: false,
    },
    lectures: {
      type: [String],
      required: true,
    },
    time: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
  },
  { timestamps: true }
);

courseSchema.pre('save', async function (next) {
  //check user
  const isExistTecher = await Teacher.findOne({ _id: this.teacherID });
  if (!isExistTecher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }
  next();
});

export const Course = model<ICourse, CourseModel>('Course', courseSchema);
