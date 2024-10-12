import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { Teacher } from '../teacher/teacher.model';
import { ComplainModel, IComplain } from './complain.interface';

const complainSchema = new Schema<IComplain, ComplainModel>(
  {
    subject: {
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
