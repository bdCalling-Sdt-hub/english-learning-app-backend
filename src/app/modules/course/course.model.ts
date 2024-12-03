import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, ObjectId, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { CourseModel, ICourse } from './course.interface';
import { Teacher } from '../teacher/teacher.model';
import { LANGUAGE } from '../../../enums/language';

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
      default: 'freelancer',
      required: false,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
      required: false,
    },
    language: {
      type: String,
      enum: LANGUAGE,
      default: LANGUAGE.ENGLISH,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
      default: '',
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
      required: false,
    },
    enrollmentsID: {
      type: [String],
      required: false,
    },
    lectures: {
      type: [String],
      required: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'draft', 'completed', 'delete'],
      default: 'draft',
    },
  },
  { timestamps: true }
);
courseSchema.index({ name: 'text', details: 'text' });
courseSchema.pre('save', async function (next) {
  //check user
  const isExistTecher = await Teacher.findOne({ _id: this.teacherID });
  if (!isExistTecher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }

  if (isExistTecher.status === 'deleted') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher deleted!');
  }
  if (isExistTecher.gender) {
    this.gender = isExistTecher.gender;
  }
  next();
});

export const Course = model<ICourse, CourseModel>('Course', courseSchema);
