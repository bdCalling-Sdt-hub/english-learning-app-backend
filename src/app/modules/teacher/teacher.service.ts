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
import path from 'path';
import { createLogger } from 'winston';
import bcrypt from 'bcrypt';
import { Student } from '../student/student.model';
import { Admin } from '../admin/admin.model';
import { TeacherValidation } from './teacher.validation';
const stripeSecretKey = config.stripe_secret_key;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not defined.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-09-30.acacia',
});

const createTeacherToDB = async (req: any) => {
  const { ...user } = req.body;
  const isExistStudent = await Student.findOne({ email: user.email });
  const isExistAdmin = await Admin.findOne({ email: user.email });

  if (isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin already exist!');
  }
  if (isExistStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student already exist!');
  }
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
const uploadFileToStripe = async (filePath: string): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();

    let mimeType: string;
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    const file = await stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: fileBuffer,
        name: fileName,
        type: mimeType,
      },
    });
    return file.id;
  } catch (error) {
    console.error('Error uploading file to Stripe:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to upload file to Stripe'
    );
  }
};

const createTeacherStripeAccount = async (
  data: any,
  files: any,
  paths: any,
  ip: string
): Promise<string> => {
  const values = await JSON.parse(data);

  const isExistUser = await Teacher.findOne({ email: values.email });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const dob = new Date(values.dateOfBirth);

  // Process KYC
  const KYCFiles = files;
  if (!KYCFiles || KYCFiles.length < 2) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Two KYC files are required!');
  }
  const uploadsPath = path.join(__dirname, '../../../..');

  // File upload to Stripe
  const frontFileId = await uploadFileToStripe(
    `${uploadsPath}/uploads/${paths[0]}`
  );
  const backFileId = await uploadFileToStripe(
    `${uploadsPath}/uploads/${paths[1]}`
  );

  // Create token
  const token = await stripe.tokens.create({
    account: {
      individual: {
        dob: {
          day: dob.getDate(),
          month: dob.getMonth() + 1,
          year: dob.getFullYear(),
        },
        id_number: values.idNumber,
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phoneNumber,
        address: {
          city: values.address.city,
          country: values.address.country,
          line1: values.address.line1,
          state: values.address.state,
          postal_code: values.address.postal_code,
        },
        ssn_last_4: values.idNumber.slice(-4),

        verification: {
          document: {
            front: frontFileId,
            back: backFileId,
          },
        },
      },
      business_type: 'individual',
      tos_shown_and_accepted: true,
    },
  });
  // Create account
  const account = await stripe.accounts.create({
    type: 'custom',
    country: values.address.country,
    email: isExistUser.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      mcc: '5734',
      name: values.business_profile.business_name || isExistUser.firstName,
      url: values.business_profile.website || 'https://example.com',
    },
    external_account: {
      object: 'bank_account',
      account_number: values.bank_info.account_number,
      country: values.bank_info.country,
      currency: values.bank_info.currency,
      account_holder_name: values.bank_info.account_holder_name,
      account_holder_type: values.bank_info.account_holder_type,
      routing_number: values.bank_info.routing_number,
    },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: ip, // Replace with the user's actual IP address
    },
  });

  // Update account with additional information
  await stripe.accounts.update(account.id, {
    account_token: token.id,
  });

  // Save to the DB
  if (account.id && account?.external_accounts?.data.length) {
    isExistUser.accountInformation.stripeAccountId = account.id;
    isExistUser.accountInformation.externalAccountId =
      account.external_accounts.data[0].id;
    isExistUser.accountInformation.status = 'active';
    await Teacher.findByIdAndUpdate(values.teacherID, isExistUser);
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: config.stripe_refresh_url || 'https://example.com/reauth',
    return_url: config.stripe_return_url || 'https://example.com/return',
    type: 'account_onboarding',
    collect: 'eventually_due',
  });

  return accountLink.url;
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

const deleteTeacherFromDB = async (
  id: string,
  password: string
): Promise<Partial<any>> => {
  const isExistTeacher = await Teacher.findById(id);
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }
  const isUserAppointed = isExistTeacher.type === 'platform';
  if (isUserAppointed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Platform teacher cannot be deleted!'
    );
  }
  const isPasswordMatch = bcrypt.compare(password, isExistTeacher.password);
  if (!isPasswordMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid password!');
  }
  const result = await Teacher.findOneAndDelete({ _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Couldn't delete teacher!");
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
  uploadFileToStripe,
};
