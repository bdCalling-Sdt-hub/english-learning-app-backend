import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StudentService } from './student.service';
import { Server } from 'socket.io';

const createStudent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const io: Server = req.app.get('io');
    const result = await StudentService.createStudentToDB(userData, io);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        'Student Registered successfully please check your email for OTP',
      data: '',
    });
  }
);

const getStudentProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await StudentService.getStudentProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user.id;
    let profile;
    if (req.files && 'profile' in req.files && req.files.profile[0]) {
      profile = `/profiles/${req.files.profile[0].filename}`;
    }

    const data = {
      profile,
      ...req.body,
    };
    const result = await StudentService.updateProfileToDB(id, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await StudentService.getAllStudentsFromDB(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Students retrieved successfully',
    pagination: {
      currentPage: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
      total: result.length,
    },
    data: result,
  });
});

const getStudentById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await StudentService.getStudentByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Student retrieved successfully',
    data: result,
  });
});
const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await StudentService.deleteStudentFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Student deleted successfully',
    data: result,
  });
});

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.body.courseId;
  const studentId = req.body.studentId;
  const result = await StudentService.addToWishlistToDB(courseId, studentId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course added to wishlist successfully',
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.body.courseId;
  const studentId = req.body.studentId;
  const result = await StudentService.removeFromWishlistToDB(
    courseId,
    studentId
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Student removed from wishlist successfully',
    data: result,
  });
});

const selectBannerByID = catchAsync(async (req: Request, res: Response) => {
  const bannerId = req.body.bannerId;
  const studentId = req.body.studentId;
  const result = await StudentService.selectBannerByIDToDB(bannerId, studentId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Banner selected successfully',
    data: result,
  });
});

const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user.id;
  const result = await StudentService.getWishlistFromDB(studentId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Wishlist retrieved successfully',
    data: result,
  });
});

export const StudentController = {
  createStudent,
  getStudentProfile,
  updateProfile,
  getAllStudents,
  getStudentById,
  removeFromWishlist,
  deleteStudent,
  addToWishlist,
  getWishlist,
  selectBannerByID,
};
