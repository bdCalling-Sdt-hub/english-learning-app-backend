import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IInfo, InfoModel } from './info.interface';

const InfoSchema = new Schema<IInfo, InfoModel>(
  {
    Name: {
      type: String,
      required: true,
    },
    About: {
      type: String,
      required: true,
    },
    PrivecyPolicy: {
      type: String,
      required: true,
    },
    TermsAndConditions: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Info = model<IInfo, InfoModel>('Info', InfoSchema);
