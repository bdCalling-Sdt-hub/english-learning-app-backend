import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { Education } from '../../../types/teacher';
import { LANGUAGE } from '../../../enums/language';

export type ITeacher = {
  name: string;
  role?: USER_ROLES;
  phone?: string;
  pendingEarnings?: number;
  address?: string;
  appointedBy?: string;
  banner?: string;
  email: string;
  about?: string;
  location?: string;
  skills?: string[];
  password: string;
  appId?: string;
  loginType?: string;
  profile?: string;
  // language?: LANGUAGE.ENGLISH | LANGUAGE.HEBREW | LANGUAGE.SPANISH;
  country?: string;
  type?: 'platform' | 'freelancer';
  gender?: 'male' | 'female' | 'other';
  status?: 'active' | 'deleted';
  verified?: boolean;
  earnings?: number;

  dateOfBirth?: {
    day: number;
    month: number;
    year: number;
  };
  accountInformation?: {
    bankAccountNumber?: string;
    stripeAccountId?: string;
    externalAccountId?: string;
    status?: string;
  };
  designation?: string;
  experience?: string;
  // education?: Education[];
  degree?: string;
  institute?: string;
  educationFiles?: string[];

  authentication?: {
    isResetPassword: boolean;
    oneTimeCode?: string;
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
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
} & Model<ITeacher>;
