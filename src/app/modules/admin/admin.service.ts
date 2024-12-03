import { StatusCodes } from 'http-status-codes';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IAdmin } from './admin.interface';
import { Admin } from './admin.model';
import { Teacher } from '../teacher/teacher.model';
import { emailTemplate } from '../../../shared/emailTemplate';
import generateOTP from '../../../util/generateOTP';
import { emailHelper } from '../../../helpers/emailHelper';
import app from '../../../app';
import { Student } from '../student/student.model';
import { NotificationService } from '../notifications/notification.service';
import { Server } from 'socket.io';

const createAdminToDB = async (
  userData: IAdmin,
  type: string | undefined = undefined
) => {
  const isExistAdmin = await Admin.findOne({ email: userData.email });
  const isExistTeacher = await Teacher.findOne({ email: userData.email });
  const isExistStudent = await Student.findOne({ email: userData.email });
  if (isExistAdmin || isExistTeacher || isExistStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }
  const admin = await Admin.create({
    ...userData,
    type: type || AdminTypes.ADMIN,
  });

  if (!admin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong!');
  }

  return admin;
};

const updateAdminToDB = async (id: string, userData: IAdmin): Promise<any> => {
  if (userData.type && userData.type !== AdminTypes.SUPERADMIN) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot update admin types!'
    );
  }
  const isExistAdmin = await Admin.findOne({ email: userData.email });
  const isExistTeacher = await Teacher.findOne({ email: userData.email });
  const isExistStudent = await Student.findOne({ email: userData.email });
  if (isExistAdmin || isExistTeacher || isExistStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }
  const admin = await Admin.findByIdAndUpdate(id, userData, {
    new: true,
  });
  if (!admin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong!');
  }
  return admin;
};

const getAdminByIdFromDB = async (id: string) => {
  const admin = await Admin.findById(id);
  if (!admin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found!');
  }
  return admin;
};
const getAdminsFromDB = async () => {
  const admins = await Admin.find({ type: { $ne: AdminTypes.SUPERADMIN } });
  if (!admins) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found!');
  }
  return admins;
};
const deleteAdminFromDB = async (id: string) => {
  const existAdmin = await Admin.findById(id);
  if (!existAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found!');
  }
  if (existAdmin.type === AdminTypes.SUPERADMIN) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Super admin cannot be deleted!'
    );
  }
  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not deleted!');
  }
  return admin;
};

const createAppointedTeacherToDB = async (
  userData: any,
  adminId: string,
  io: Server
) => {
  const isExistAdmin = await Admin.findById(adminId);
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found!');
  }
  const isExistTeacher = await Teacher.isExistTeacherByEmail(userData.email);
  if (isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher already exist!');
  }
  const isExistStudent = await Student.findOne({ email: userData.email });
  if (isExistTeacher || isExistStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }
  const data = {
    ...userData,
    appointedBy: adminId,
    type: 'platform',
    verified: true,
  };
  const createdTeacher = await Teacher.create(data);
  if (!createdTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong!');
  }
  const studentMessage = `${createdTeacher.name} have became an appointed teacher.`;
  const notificationSentStudent =
    await NotificationService.sendNotificationToAllUsersOfARole(
      USER_ROLES.STUDENT,
      {
        sendTo: USER_ROLES.STUDENT,
        message: studentMessage,
        status: 'unread' as const,
      },
      io
    );

  if (!notificationSentStudent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong!');
  }
  return createdTeacher;
};

const makeTeacherAppointedToDB = async (
  id: string,
  adminId: string,
  io: Server
) => {
  const isExistAdmin = await Admin.findById(adminId);
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found!');
  }

  const isExistTeacher = await Teacher.findById(id);
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }

  if (isExistTeacher.type === 'platform') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Already appointed as platform teacher!'
    );
  }

  const appointedTeacher = await Teacher.findOneAndUpdate(
    { _id: id },
    { $set: { type: 'platform', appointedBy: adminId } },
    { new: true }
  );

  if (!appointedTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong!');
  }

  // Send notification to the appointed teacher
  const notificationData = {
    sendTo: USER_ROLES.TEACHER,
    sendUserID: isExistTeacher._id.toString(),
    message: 'You have been appointed as a platform teacher.',
    status: 'unread' as const,
  };

  await NotificationService.sendNotificationToDB(notificationData, io);

  return appointedTeacher;
};

const makeTeacherUnappointedToDB = async (id: string, adminId: string) => {
  const isExistAdmin = await Admin.findById(adminId);
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found!');
  }

  const isExistTeacher = await Teacher.findById(id);
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }

  const unappointedTeacher = await Teacher.findOneAndUpdate(
    { _id: id },
    { $set: { type: 'freelancer', appointedBy: null } },
    { new: true }
  );

  if (!unappointedTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong!');
  }

  return unappointedTeacher;
};

export const AdminService = {
  createAdminToDB,
  updateAdminToDB,
  getAdminByIdFromDB,
  getAdminsFromDB,
  deleteAdminFromDB,
  createAppointedTeacherToDB,
  makeTeacherAppointedToDB,
  makeTeacherUnappointedToDB,
};
