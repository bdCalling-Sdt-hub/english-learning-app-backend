import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema, Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { ISeminar, SeminarModel } from './seminar.interface';
import { Teacher } from '../teacher/teacher.model';

const seminarSchema = new Schema<ISeminar, SeminarModel>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    date: {
      type: String,
      required: [true, 'date is required'],
    },
    time: {
      type: String,
      required: [true, 'time is required'],
    },
    duration: {
      type: String,
      required: [true, 'duration is required'],
    },
    teacher: {
      type: Schema.ObjectId,
      ref: 'Teacher',
      required: [true, 'teacherID is required'],
    },
    link: {
      type: String,
      required: false,
      default: '',
    },
    banner: {
      type: String,
      required: [true, 'banner is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'completed', 'deleted'],
      default: 'published',
    },
    bookings: {
      type: [String],
      default: [],
      required: false,
    },
  },
  { timestamps: true }
);

seminarSchema.pre('save', async function (next) {
  const isTeacherExist = await Teacher.findOne({ _id: this.teacher });
  if (!isTeacherExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }
  const isTeacherAppointed = isTeacherExist.type === 'platform';
  if (!isTeacherAppointed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Teacher is not appointed to platform!'
    );
  }

  next();
});

export const Seminar = model<ISeminar, SeminarModel>('Seminars', seminarSchema);
