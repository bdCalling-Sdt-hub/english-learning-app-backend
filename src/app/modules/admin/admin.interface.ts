import { Model } from 'mongoose';
import { AdminTypes, USER_ROLES } from '../../../enums/user';

export type IAdmin = {
  name: string;
  email: string;
  password: string;
  type?: AdminTypes;
  status?: 'active' | 'delete';
  profile?: string;
  verified?: boolean;
  appId?: string;
  loginType?: string;
  role?: USER_ROLES.ADMIN;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode?: string;
    expireAt?: Date;
  };
};

export type AdminModel = Model<IAdmin>;
