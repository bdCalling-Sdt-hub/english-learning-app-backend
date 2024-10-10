import { StatusCodes } from 'http-status-codes';
import { AdminTypes } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IAdmin } from './admin.interface';
import { Admin } from './admin.model';

const createAdminToDB = async (
  userData: IAdmin,
  type: string | undefined = undefined
) => {
  const admin = await Admin.create({
    ...userData,
    type: type || AdminTypes.ADMIN,
  });

  if (!admin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong!');
  }
  return admin;
};

const updateAdminToDB = async (id: string, userData: IAdmin) => {
  if (userData.type && userData.type !== AdminTypes.SUPERADMIN) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot update admin types!'
    );
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
  const admins = await Admin.find({});
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

export const AdminService = {
  createAdminToDB,
  updateAdminToDB,
  getAdminByIdFromDB,
  getAdminsFromDB,
  deleteAdminFromDB,
};
