import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { AdminService } from './admin.service';

const createSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await AdminService.createAdminToDB(userData, 'SUPERADMIN');

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Super admin created successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await AdminService.createAdminToDB(userData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin created successfully',
    data: result,
  });
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { ...userData } = req.body;
  const result = await AdminService.updateAdminToDB(id, userData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin updated successfully',
    data: result,
  });
});
const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAdminsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admins retrieved successfully',
    data: result,
  });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await AdminService.getAdminByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin retrieved successfully',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await AdminService.deleteAdminFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin deleted successfully',
    data: result,
  });
});

const createAppointedTeacher = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.params.adminId;
    const { ...userData } = req.body;
    const result = await AdminService.createAppointedTeacherToDB(
      userData,
      adminId
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Appointed teacher created successfully',
      data: result,
    });
  }
);

const makeTeacherAppointed = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const adminId = req.params.adminId;
  const result = await AdminService.makeTeacherAppointedToDB(id, adminId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Teacher appointed successfully',
    data: result,
  });
});

export const AdminController = {
  createAdmin,
  createSuperAdmin,
  updateAdmin,
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  createAppointedTeacher,
  makeTeacherAppointed,
};
