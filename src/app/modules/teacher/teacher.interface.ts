import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { Education } from '../../../types/teacher';

export type ITeacher = {
  firstName: string;
  lastName: string;
  role?: USER_ROLES;
  phoneNumber: string;
  appointedBy?: string;
  email: string;
  password: string;
  profile?: string;
  country?: string;
  type?: 'platform' | 'freelancer';
  gender?: 'male' | 'female' | 'other';
  status?: 'active' | 'deleted';
  verified?: boolean;
  dateOfBirth?: {
    day: number;
    month: number;
    year: number;
  };
  accountInformation: {
    stripeAccountId?: string;
    externalAccountId?: string;
    status?: string;
  };
  designation?: string;
  experience?: number;
  education?: Education[];

  authentication?: {
    isResetPassword: boolean;
    oneTimeCode?: number;
    expireAt?: Date;
  };
};

export interface TeacherStripeAccountData {
  dateOfBirth: {
    day: number;
    month: number;
    year: number;
  };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  addressLine1: string;
  postCode: string;
  frontFilePart: { id: string };
  backFilePart: { id: string };
  bank_info: {
    account_holder_name: string;
    account_holder_type: string;
    account_number: string;
    country: string;
    currency: string;
  };
  accountInformation: {
    stripeAccountId?: string;
    externalAccountId?: string;
    status?: boolean;
  };
}

export type TeacherModel = {
  isExistTeacherById(id: string): Promise<ITeacher | null>;
  isExistTeacherByEmail(email: string): Promise<ITeacher | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
} & Model<ITeacher>;
