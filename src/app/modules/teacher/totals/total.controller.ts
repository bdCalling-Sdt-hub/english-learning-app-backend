import { Request, Response } from 'express';
import sendResponse from '../../../../shared/sendResponse';
import catchAsync from '../../../../shared/catchAsync';
import { totalService } from './total.controller.service';

const getOverallRating = catchAsync(async (req: Request, res: Response) => {
  const teacher = req.user.id;
  console.log(teacher);
  const result = await totalService.getOverallRating(teacher?.toString()!);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Overall Rating',
    data: result,
  });
});
const getEarnings = catchAsync(async (req: Request, res: Response) => {
  const teacher = req.user.id;

  const result = await totalService.getEarnings(teacher?.toString()!);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Earnings',
    data: result,
  });
});

const getCourseStatus = catchAsync(async (req: Request, res: Response) => {
  const teacher = req.user.id;
  const result = await totalService.getCourseStatus(teacher?.toString()!);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Course Status',
    data: result,
  });
});

export const totalController = {
  getOverallRating,
  getEarnings,
  getCourseStatus,
};
