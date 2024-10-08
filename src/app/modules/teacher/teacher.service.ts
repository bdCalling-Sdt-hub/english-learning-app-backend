import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { ITeacher } from './teacher.interface';
import { Teacher } from './teacher.model';
import Stripe from 'stripe';
import config from '../../../config';
import fs from 'fs';

const stripeSecretKey = config.stripe_secret_key;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not defined.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-09-30.acacia',
});

const createTeacherToDB = async (req: any) => {
  const { ...user } = req.body;
  const isExistTeacher = await Teacher.isExistTeacherByEmail(user.email);
  if (isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher already exist!');
  }

  const createdTeacher = await Teacher.create(user);
  if (!createdTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong!');
  }
  const otp = generateOTP();
  const values = {
    name: createdTeacher.firstName,
    otp: otp,
    email: createdTeacher.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await Teacher.findOneAndUpdate(
    { _id: createdTeacher._id },
    { $set: { authentication } }
  );

  return createdTeacher;
};

const createTeacherStripeAccount = async (data: any) => {
  const token = await stripe.tokens.create({
    account: {
      individual: {
        dob: {
          day: data.dateOfBirth.day,
          month: data.dateOfBirth.month,
          year: data.dateOfBirth.year,
        },
        first_name: data?.firstName,
        last_name: data?.lastName,
        email: data?.email,
        phone: data.phone,
        address: {
          city: data.city,
          country: data.country,
          line1: data.addressLine1,
          postal_code: data.address.postCode,
        },
        verification: {
          document: {
            front: data.frontFilePart.id,
            back: data.backFilePart.id,
          },
        },
      },
      business_type: 'individual',
      tos_shown_and_accepted: true,
    },
  });

  //account created
  const account = await stripe.accounts.create({
    type: 'custom',
    account_token: token.id,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      mcc: '5970',
      name: data.firstName,
      url: 'www.example.com',
    },
    external_account: {
      object: 'bank_account',
      account_holder_name: data.bank_info.account_holder_name,
      account_holder_type: data.bank_info.account_holder_type,
      account_number: data.bank_info.account_number,
      country: data.bank_info.country,
      currency: data.bank_info.currency,
    },
  });

  //save to the DB
  if (account.id && account?.external_accounts?.data.length) {
    data.accountInformation.stripeAccountId = account.id;
    data.accountInformation.externalAccountId =
      account.external_accounts?.data[0].id;
    data.accountInformation.status = true;
    await data.save();
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://example.com/reauth',
    return_url: 'https://example.com/return',
    type: 'account_onboarding',
    collect: 'eventually_due',
  });

  return accountLink;
};
const getTeacherProfileFromDB = async (
  teacher: JwtPayload
): Promise<Partial<ITeacher>> => {
  const { id } = teacher;
  const isExistTeacher = await Teacher.isExistTeacherById(id);
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }

  return isExistTeacher;
};

const updateProfileToDB = async (
  id: string,
  payload: Partial<ITeacher>
): Promise<Partial<ITeacher | null>> => {
  const isExistUser = await Teacher.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }

  //unlink file here
  if (payload.profile) {
    unlinkFile(isExistUser.profile!);
  }

  const updateDoc = await Teacher.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getAllTeachersFromDB = async (): Promise<Partial<ITeacher>[]> => {
  const result = await Teacher.find({}, { password: 0 });
  return result;
};
const getTeacherByIdFromDB = async (
  id: string
): Promise<Partial<ITeacher | null>> => {
  const result = await Teacher.findOne({ _id: id }, { password: 0 });
  return result;
};

const deleteTeacherFromDB = async (id: string): Promise<Partial<any>> => {
  const result = await Teacher.findOneAndDelete({ _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }
  return { message: 'Teacher deleted successfully' };
};

export const TeacherService = {
  createTeacherToDB,
  getTeacherProfileFromDB,
  updateProfileToDB,
  getAllTeachersFromDB,
  getTeacherByIdFromDB,
  createTeacherStripeAccount,
  deleteTeacherFromDB,
};
