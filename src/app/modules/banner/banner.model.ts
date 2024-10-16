import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { BannerModel, IBanner } from './banner.interface';

const BannerSchema = new Schema<IBanner, BannerModel>(
  {
    URL: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Banner = model<IBanner, BannerModel>('Banner', BannerSchema);
