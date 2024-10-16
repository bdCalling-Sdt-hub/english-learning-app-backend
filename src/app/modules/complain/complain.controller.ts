import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { complainService } from './complain.service';

const createComplain = catchAsync(async (req: Request, res: Response) => {
  const { ...complainData } = req.body;
  const data = {
    ...complainData,
  };
  const result = await complainService.createComplainToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Complain created successfully',
    data: result,
  });
});

const getComplainById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await complainService.getComplainByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Complain retrieved successfully',
    data: result,
  });
});
const getAllComplains = catchAsync(async (req: Request, res: Response) => {
  const result = await complainService.getAllComplainsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Complains retrieved successfully',
    data: result,
  });
});

const getEnrolledTeachers = catchAsync(async (req: Request, res: Response) => {
  const email = req.params.email;
  const result = await complainService.getEnrolledTeachersFromDB(email);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Teachers retrieved successfully',
    data: result,
  });
});
export const ComplainController = {
  createComplain,
  getAllComplains,
  getComplainById,
  getEnrolledTeachers,
};
