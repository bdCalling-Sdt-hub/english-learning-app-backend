import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { Education } from '../../../types/teacher';

export type ITeacher = {
  firstName: string;
  lastName: string;
  role?: USER_ROLES;
  phoneNumber: string;
  email: string;
  password: string;
  location?: string;
  profile?: string;
  country?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  postCode?: string;
  state?: string;
  idNumber?: string;
  ip?: string;
  gender?: 'male' | 'female' | 'other';
  status?: 'active' | 'deleted';
  verified?: boolean;
  dateOfBirth?: {
    day: number;
    month: number;
    year: number;
  };
  ssnLast4?: string;
  designation?: string;
  experience?: number;
  stripeAccountId?: string;
  externalAccountId?: string;
  accountStatus?: boolean;
  education?: Education[];
  bank_info?: {
    account_holder_name: string;
    account_holder_type: string;
    account_number: string;
    country: string;
    currency: string;
  };
  business_profile?: {
    business_name?: string;
    website?: string;
  };
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode?: number;
    expireAt?: Date;
  };
};

export type TeacherModel = {
  isExistTeacherById(id: string): Promise<ITeacher | null>;
  isExistTeacherByEmail(email: string): Promise<ITeacher | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
} & Model<ITeacher>;
