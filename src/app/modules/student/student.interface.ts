import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { LANGUAGE } from '../../../enums/language';

export type IStudent = {
  name: string;
  role: USER_ROLES;
  phone: string;
  email: string;
  banner: string;
  password: string;
  wishlist?: [string];
  address: string;
  profile?: string;
  status: 'active' | 'delete';
  verified: boolean;
  gender: string;
  dateOfBirth: Date;
  language: LANGUAGE.ENGLISH | LANGUAGE.HEBREW | LANGUAGE.SPANISH;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type StudentModel = {
  isExistStudentById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IStudent>;
