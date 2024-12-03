import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { INotification, NotificationModel } from './notification.interface';
import { object } from 'zod';

const NotificationSchema = new Schema<INotification, NotificationModel>(
  {
    sendTo: {
      type: String,
      required: [true, 'sendTo is required'],
    },
    sendUserID: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    data: {
      type: Object,
      required: false,
    },
    link: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['read', 'unread'],
      required: [true, 'This is required'],
      default: 'unread',
    },
  },
  { timestamps: true }
);

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  NotificationSchema
);
