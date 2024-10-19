import { Model } from 'mongoose';
import { AdminTypes, USER_ROLES } from '../../../enums/user';

export type IAdmin = {
  name: string;
  email: string;
  password: string;
  type?: AdminTypes;
  status?: 'active' | 'delete';
  verified?: boolean;
  role?: USER_ROLES.ADMIN;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode?: string;
    expireAt?: Date;
  };
};

export type AdminModel = Model<IAdmin>;
