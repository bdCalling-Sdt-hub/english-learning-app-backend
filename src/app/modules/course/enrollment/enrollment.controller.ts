import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { EnrollmentService } from './enrollment.service';
import { Response, Request } from 'express';

const createEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { ...enrollmentData } = req.body;
  const data = {
    ...enrollmentData,
  };
  const result = await EnrollmentService.createEnrollmentToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Enrollment created successfully',
    data: result,
  });
});

export const EnrollmentController = {
  createEnrollment,
};
