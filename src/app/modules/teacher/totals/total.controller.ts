import { Request, Response } from 'express';
import sendResponse from '../../../../shared/sendResponse';
import catchAsync from '../../../../shared/catchAsync';
import { totalService } from './total.controller.service';

const getOverallRating = catchAsync(async (req: Request, res: Response) => {
  const { teacher } = req.query;
  const result = await totalService.getOverallRating(teacher?.toString()!);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Overall Rating',
    data: result,
  });
});

export const totalController = {
  getOverallRating,
};
