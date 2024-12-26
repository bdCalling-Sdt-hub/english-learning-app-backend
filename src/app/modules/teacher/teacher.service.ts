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
import { LANGUAGE } from '../../../enums/language';
import { Course } from '../course/course.model';
import { Reviews } from '../reviews/reviews.model';
import { NotificationService } from '../notifications/notification.service';
import { Server } from 'socket.io';
const stripeSecretKey = config.stripe_secret_key;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not defined.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-09-30.acacia',
});

const createTeacherToDB = async (req: any) => {
  const email = req.body.email;
  const validDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'aol.com',
    'outlook.com',
  ];
  for (const domain of validDomains) {
    if (email.toString().includes(domain)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Please provide a valid email address'
      );
    }
  }

  const isExist = await Teacher.findOne({ email: req.body.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }
  const { ...user } = req.body;
  const isExistStudent = await Student.findOne({ email: user.email });
  const isExistAdmin = await Admin.findOne({ email: user.email });

  if (isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin already exist!');
  }
  if (isExistStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student already exist!');
  }
  const isExistTeacher = await Teacher.findOne({ email: user.email });
  if (isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher already exist!');
  }

  const createdTeacher = await Teacher.create(user);
  if (!createdTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong!');
  }
  const otp = generateOTP();
  const values = {
    name: createdTeacher.name,
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
  user: any,
  paths: any,
  ip: string
): Promise<string> => {
  const values = await JSON.parse(data);

  const isExistUser = await Teacher.findOne({ email: user?.email });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.email !== user.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Email doesn't match");
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
        first_name:
          values.name.split(' ')[0] ||
          isExistUser.name.split(' ')[0] ||
          isExistUser.name,
        last_name:
          values.name.split(' ')[1] ||
          isExistUser.name.split(' ')[1] ||
          isExistUser.name,
        email: user.email,
        phone: values.phoneNumber,
        address: {
          city: values.address.city,
          country: values.address.country,
          line1: values.address.line1,
          state: values.address.state,
          postal_code: values.address.postal_code,
        },
        ...(values.idNumber && { ssn_last_4: values.idNumber.slice(-4) }),
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
    email: values.email || isExistUser.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      mcc: '5734',
      name: `${isExistUser.name}`,
      url: 'https://medspaceconnect.com',
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
    //@ts-ignore
    isExistUser.accountInformation.stripeAccountId = account.id;
    //@ts-ignore
    isExistUser.accountInformation.bankAccountNumber =
      values.bank_info.account_number;
    //@ts-ignore
    isExistUser.accountInformation.externalAccountId =
      account.external_accounts.data[0].id;
    //@ts-ignore
    isExistUser.accountInformation.status = 'active';
    await Teacher.findByIdAndUpdate(user.id, isExistUser);
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
  payload: Partial<ITeacher>,
  io: Server
): Promise<Partial<ITeacher | null>> => {
  console.log(await JSON.stringify(payload));
  const isExistUser: any = await Teacher.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }
  if (payload.email) {
    const isExistEmail = await Teacher.findOne({ email: payload.email });
    if (isExistEmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
    }
  }
  if (typeof payload.skills === 'string') {
    //@ts-ignore
    payload.skills = JSON.parse(payload.skills.replace(/'/g, '"'));
  }
  if (payload.educationFiles && payload.educationFiles.length >= 1) {
    await NotificationService.sendNotificationToAllUsersOfARole(
      USER_ROLES.ADMIN,
      {
        sendTo: USER_ROLES.ADMIN,
        title: `${isExistUser.name} has uploaded new education files. Please verify them.`,
        description: 'Please verify the uploaded education files.',
        data: {
          teacherID: id,
        },
      },
      io
    );
    if (isExistUser.educationFiles && isExistUser.educationFiles.length >= 1) {
      for (const file of isExistUser.educationFiles) {
        await unlinkFile(file);
      }
    }
  }

  //unlink file here
  if (
    payload.profile &&
    isExistUser.profile?.toString().length > 2 &&
    isExistUser.profile !== '/profile/default.png'
  ) {
    await unlinkFile(isExistUser.profile);
  }

  const updateDoc = await Teacher.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getAllTeachersFromDB = async (
  query: any
): Promise<Partial<ITeacher>[]> => {
  const { page = 1, limit = 10, searchTerm = '' } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const searchConditions = searchTerm
    ? {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { language: { $regex: searchTerm, $options: 'i' } },
        ],
      }
    : {};

  const result = await Teacher.find(searchConditions, { password: 0 })
    .skip(skip)
    .limit(Number(limit));

  return result;
};
const getTeacherByIdFromDB = async (
  id: string
): Promise<Partial<ITeacher | null>> => {
  const result = await Teacher.findOne({ _id: id }, { password: 0 });
  if (!result)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  const courses = await Course.find({ teacherID: id });
  const reviews = await Reviews.find({ teacher: id }).select('star').lean();
  const totalStar = reviews.reduce((acc, review) => acc + review.star, 0);
  const teacherRating = totalStar / reviews.length;
  const finalCourseData = await Promise.all(
    courses.map(async course => {
      return {
        //@ts-ignore
        ...course._doc,
        teacherName: result.name,
        //@ts-ignore
        totalLectures: course.lectures.length,
      };
    })
  );
  const finalResult = {
    //@ts-ignore
    ...result._doc,
    finalCourseData,
    teacherRating,
  };
  return finalResult;
};

const deleteTeacherFromDB = async (id: string): Promise<Partial<any>> => {
  const isExistTeacher = await Teacher.findById(id);
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Teacher doesn't exist!");
  }
  const result = await Teacher.findOneAndDelete({ _id: id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Couldn't delete teacher!");
  }
  return { message: 'Teacher deleted successfully' };
};

const getTeachersByLanguageFromDB = async (language: string) => {
  if (
    language !== LANGUAGE.ENGLISH &&
    language !== LANGUAGE.HEBREW &&
    language !== LANGUAGE.SPANISH
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Language can only be either ENGLISH, HEBREW or SPANISH!'
    );
  }
  const result = await Teacher.find({ language });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teachers not found!');
  }
  return result;
};

export const TeacherService = {
  createTeacherToDB,
  getTeacherProfileFromDB,
  getTeachersByLanguageFromDB,
  updateProfileToDB,
  getAllTeachersFromDB,
  getTeacherByIdFromDB,
  createTeacherStripeAccount,
  deleteTeacherFromDB,
  uploadFileToStripe,
};
