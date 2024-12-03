import { Model } from 'mongoose';
import { AdminTypes, USER_ROLES } from '../../../enums/user';

export type INotification = {
  sendTo:
    | USER_ROLES.ADMIN
    | USER_ROLES.STUDENT
    | USER_ROLES.TEACHER
    | AdminTypes.SUPERADMIN;
  sendUserID?: string;
  title: string;
  description: string;
  data?: object;
  link?: string;
  status?: 'unread' | 'read';
  createdAt?: Date;
  updatedAt?: Date;
};

export type NotificationModel = Model<INotification>;
