import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IStudent } from './student.interface';
import { Student } from './student.model';
import { Teacher } from '../teacher/teacher.model';
import sendResponse from '../../../shared/sendResponse';
import { isStudentDeleted } from '../../../util/isDeleted';

const createStudentToDB = async (
  payload: Partial<IStudent>
): Promise<IStudent> => {
  //set role
  payload.role = USER_ROLES.STUDENT;
  const createUser = await Student.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
  const existTeacher = await Teacher.findOne({ email: createUser.email });
  if (existTeacher) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Email already exist in teacher!'
    );
  }
  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await Student.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return createUser;
};

const getStudentProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IStudent>> => {
  const { id } = user;
  const isExistUser = await Student.isExistStudentById(id);
  const isDeleted = isStudentDeleted(isExistUser);
  if (isDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User already deleted!');
  }
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  id: string,
  payload: Partial<IStudent>
): Promise<Partial<IStudent | null>> => {
  const isExistUser = await Student.isExistStudentById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const isDeleted = isStudentDeleted(isExistUser);
  if (isDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student deleted!');
  }
  //unlink file here
  if (payload.profile) {
    unlinkFile(isExistUser.profile);
  }

  const updateDoc = await Student.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getAllStudentsFromDB = async (): Promise<IStudent[]> => {
  const result = await Student.find({ status: { $ne: 'delete' } }).select(
    '-cardNumber'
  );
  return result;
};

const getStudentByIdFromDB = async (
  id: string
): Promise<Partial<IStudent | null>> => {
  const result = await Student.findOne({ _id: id }, { password: 0 });
  const isDeleted = isStudentDeleted(result);
  if (isDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student deleted!');
  }
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const existStudent = await Student.isExistStudentById(id);
  if (!existStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Student doesn't exist!");
  }
  if (existStudent.status === 'delete') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student already deleted!');
  }
  await Student.findOneAndUpdate({ _id: id }, { status: 'delete' });

  return { message: 'Student deleted successfully' };
};

export const StudentService = {
  createStudentToDB,
  getStudentProfileFromDB,
  updateProfileToDB,
  getAllStudentsFromDB,
  getStudentByIdFromDB,
  deleteStudentFromDB,
};
