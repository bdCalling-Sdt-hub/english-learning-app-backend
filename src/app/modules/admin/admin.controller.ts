import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { AdminService } from './admin.service';
import { Server } from 'socket.io';

const createSuperAdmin = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await AdminService.createAdminToDB(userData, 'SUPERADMIN');

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Super admin created successfully',
    data: '',
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await AdminService.createAdminToDB(userData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin created successfully',
    data: '',
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
  const query = req.query;
  const result = await AdminService.getAdminsFromDB(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admins retrieved successfully',
    pagination: {
      currentPage: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
      total: result.length,
    },
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
    const io: Server = req.app.get('io');
    const result = await AdminService.createAppointedTeacherToDB(
      userData,
      adminId,
      io
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
  const io: Server = req.app.get('io');

  const result = await AdminService.makeTeacherAppointedToDB(id, adminId, io);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Teacher appointed successfully',
    data: result,
  });
});

const makeTeacherUnappointed = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const adminId = req.params.adminId;
    const result = await AdminService.makeTeacherUnappointedToDB(id, adminId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Teacher unappointed successfully',
      data: result,
    });
  }
);

const getWebSiteStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getWebSiteStatusFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Website status retrieved successfully',
    data: result,
  });
});
const getAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAdminProfile(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin profile retrieved successfully',
    data: result,
  });
});
const getMonthlyEarning = catchAsync(async (req: Request, res: Response) => {
  const { year } = req.query;
  if (!year) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Year is required');
  }
  const result = await AdminService.getMonthlyEarning(Number(year));
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Monthly earning retrieved successfully',
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
  makeTeacherUnappointed,
  getWebSiteStatus,
  getAdminProfile,
  getMonthlyEarning,
};
