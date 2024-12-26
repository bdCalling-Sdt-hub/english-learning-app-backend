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
import { Admin } from '../admin/admin.model';
import { Course } from '../course/course.model';
import { Banner } from '../banner/banner.model';
import { BANNER } from '../../../enums/banner';
import { NotificationService } from '../notifications/notification.service';
import { Server } from 'socket.io';

const createStudentToDB = async (
  payload: Partial<IStudent>,
  io: Server
): Promise<IStudent> => {
  //set role
  payload.role = USER_ROLES.STUDENT;
  const email = payload.email;
  const validDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'aol.com',
    'outlook.com',
  ];
  for (const domain of validDomains) {
    if (email?.toString().includes(domain)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Please provide a valid email address'
      );
    }
  }
  const isExist = await Student.findOne({ email: payload.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }
  const isExistTeacher = await Teacher.findOne({ email: payload.email });
  if (isExistTeacher) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Email already exist in teacher!'
    );
  }
  const isExistAdmin = await Admin.findOne({ email: payload.email });
  if (isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }
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
  //@ts-ignore
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
  await NotificationService.sendNotificationToAllUsersOfARole(
    USER_ROLES.ADMIN,
    {
      sendTo: USER_ROLES.ADMIN,
      title: 'New student registered',
      description: 'A new student has registered',
      data: { studentID: createUser._id },
    },
    io
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
  const isExistUser = await Student.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const isDeleted = isStudentDeleted(isExistUser);
  if (isDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student deleted!');
  }
  //unlink file here
  //@ts-ignore
  if (
    payload.profile &&
    isExistUser?.profile?.length! > 2 &&
    isExistUser.profile !== '/profile/default.png'
  ) {
    //@ts-ignore
    unlinkFile(isExistUser.profile);
  }
  const updateDoc = await Student.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getAllStudentsFromDB = async (query: any): Promise<IStudent[]> => {
  const { page = 1, limit = 10, searchTerm = '' } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const searchConditions = searchTerm
    ? {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
        ],
      }
    : {};

  const result = await Student.find(searchConditions, { password: 0 })
    .skip(skip)
    .limit(Number(limit));

  return result;
};

const getStudentByIdFromDB = async (
  id: string
): Promise<Partial<IStudent | null>> => {
  const result = await Student.findOne({ _id: id });
  const isDeleted = isStudentDeleted(result);
  if (isDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student deleted!');
  }
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const existStudent = await Student.findById(id);
  if (!existStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Student doesn't exist!");
  }
  if (existStudent.status === 'delete') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student already deleted!');
  }
  await Student.findOneAndUpdate({ _id: id }, { status: 'delete' });

  return { message: 'Student deleted successfully' };
};

const addToWishlistToDB = async (courseID: string, studentId: string) => {
  const existStudent = await Student.findOne({ _id: studentId });
  if (!existStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Student doesn't exist!");
  }
  if (existStudent.status === 'delete') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student already deleted!');
  }
  const isExistCourse = await Course.findOne({ _id: courseID });
  if (!isExistCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Course doesn't exist!");
  }
  const result = await Student.findOneAndUpdate(
    { _id: studentId },
    { $push: { wishlist: courseID } }
  );
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Course not added to wishlist!'
    );
  }
  return result;
};

const removeFromWishlistToDB = async (courseID: string, studentId: string) => {
  const existStudent = await Student.findOne({ _id: studentId });
  if (!existStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Student doesn't exist!");
  }
  if (existStudent.status === 'delete') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student already deleted!');
  }
  const isExistCourse = await Course.findOne({ _id: courseID });
  if (!isExistCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Course doesn't exist!");
  }
  const result = await Student.findOneAndUpdate(
    { _id: studentId },
    { $pull: { wishlist: courseID } }
  );
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Course not removed from wishlist!'
    );
  }
  return result;
};

const selectBannerByIDToDB = async (bannerId: string, studentId: string) => {
  const existStudent = await Student.findOne({ _id: studentId });
  if (!existStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Student doesn't exist!");
  }
  if (existStudent.status === 'delete') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Student already deleted!');
  }
  const isExistBanner = await Banner.findOne({ _id: bannerId });
  if (!isExistBanner) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Banner doesn't exist!");
  }
  if (isExistBanner.type !== BANNER.PROFILE) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Banner type is not profile!');
  }
  const result = await Student.findOneAndUpdate(
    { _id: studentId },
    { banner: bannerId }
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Banner not selected!');
  }
};
const getWishlistFromDB = async (studentId: string) => {
  // Validate student existence and status in a single query
  const existStudent = await Student.findOne({
    _id: studentId,
    status: { $ne: 'delete' },
  });

  if (!existStudent) {
    return [];
  }

  // Fetch wishlist with population in a single query
  const list = await Student.findById(studentId)
    .populate({
      path: 'wishlist',
      model: 'Course',
      populate: {
        path: 'teacherID',
        model: 'Teacher',
        select: 'name',
      },
    })
    .lean();

  if (!list?.wishlist?.length) {
    return [];
  }

  // Map wishlist courses with required details
  const result = list.wishlist.map(course => ({
    //@ts-ignore
    ...course,
    //@ts-ignore
    teacherName: course.teacherID?.name,
    //@ts-ignore
    totalLectures: course.lectures?.length || 0,
  }));

  return result;
};
export const StudentService = {
  createStudentToDB,
  getStudentProfileFromDB,
  updateProfileToDB,
  getAllStudentsFromDB,
  getStudentByIdFromDB,
  deleteStudentFromDB,
  addToWishlistToDB,
  removeFromWishlistToDB,
  selectBannerByIDToDB,
  getWishlistFromDB,
};
