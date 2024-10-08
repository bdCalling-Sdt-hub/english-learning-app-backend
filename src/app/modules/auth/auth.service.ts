import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { Student } from '../student/student.model';
import { Teacher } from '../teacher/teacher.model';
import { findInStudentAndTeacher } from '../../../util/findInStudentAndTeacher';
import { USER_ROLES } from '../../../enums/user';
import { getModelAccordingToRole } from '../../../util/getModelAccordingToRole';
import { logger } from '../../../shared/logger';

type UserModel = typeof Student | typeof Teacher;

// login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;

  const existUser = await findInStudentAndTeacher(email, 'password');
  if (!existUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const User = getModelAccordingToRole(existUser);

  if (!existUser.verified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again'
    );
  }

  if (existUser.status === 'delete') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content. It looks like your account has been deactivated.'
    );
  }

  if (password && !(await User.isMatchPassword(password, existUser.password))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  const createToken = jwtHelper.createToken(
    { id: existUser._id, role: existUser.role, email: existUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { createToken };
};

// forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await findInStudentAndTeacher(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const User = getModelAccordingToRole(isExistUser);
  const otp = generateOTP();

  const emailData = { otp, email: isExistUser.email };
  const resetPasswordEmail = emailTemplate.resetPassword(emailData);
  emailHelper.sendEmail(resetPasswordEmail);

  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000), // OTP expires in 3 minutes
  };
  // @ts-ignore
  await User.findOneAndUpdate(
    { email: isExistUser.email },
    { $set: { authentication } }
  );
};

// verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;

  const isExistUserStudent = await Student.findOne({ email }).select(
    '+authentication'
  );
  const isExistUserTeacher = await Teacher.findOne({ email }).select(
    '+authentication'
  );

  let isExistUser;
  let User;

  if (isExistUserStudent) {
    isExistUser = isExistUserStudent;
    User = Student;
  } else if (isExistUserTeacher) {
    isExistUser = isExistUserTeacher;
    User = Teacher;
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please provide the OTP. Check your email for the verification code.'
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'The OTP you provided is incorrect.'
    );
  }

  const currentTime = new Date();
  if (currentTime > isExistUser?.authentication?.expireAt!) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'The OTP has expired. Please request a new one.'
    );
  }

  let message;
  let data;

  if (!isExistUser.verified) {
    // @ts-ignore

    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        $set: {
          verified: true,
          'authentication.oneTimeCode': null,
          'authentication.expireAt': null,
        },
      }
    );
    message = 'Email verified successfully';
  } else {
    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    // @ts-ignore

    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        $set: {
          'authentication.isResetPassword': true,
          'authentication.oneTimeCode': null,
          'authentication.expireAt': null,
        },
      }
    );

    message =
      'Verification successful. Please securely store this code to reset your password.';
    data = createToken;
  }

  return { data, message };
};

// reset password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;

  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized.');
  }

  const isExistUserStudent = await Student.findById(isExistToken.user).select(
    '+authentication'
  );
  const isExistUserTeacher = await Teacher.findById(isExistToken.user).select(
    '+authentication'
  );

  let isExistUser;
  if (isExistUserStudent) {
    isExistUser = isExistUserStudent;
  } else if (isExistUserTeacher) {
    isExistUser = isExistUserTeacher;
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please initiate the 'Forgot Password' process again."
    );
  }

  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired. Please initiate the "Forgot Password" process again.'
    );
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password don't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };
  // @ts-ignore

  await isExistUser.findOneAndUpdate({ _id: isExistUser._id }, updateData, {
    new: true,
  });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await findInStudentAndTeacher(user.email, 'password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const User = getModelAccordingToRole(isExistUser);

  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = { password: hashPassword };
  // @ts-ignore

  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
};
