import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { Teacher } from '../teacher/teacher.model';
import { ComplainModel, IComplain } from './complain.interface';
import { string } from 'zod';

const complainSchema = new Schema<IComplain, ComplainModel>(
  {
    studentID: {
      type: String,
      required: true,
    },

    teacherID: {
      type: String,
      required: [true, 'This is required'],
    },
    message: {
      type: String,
      required: [true, 'This is required'],
    },
  },
  { timestamps: true }
);

export const Complain = model<IComplain, ComplainModel>(
  'Complains',
  complainSchema
);
