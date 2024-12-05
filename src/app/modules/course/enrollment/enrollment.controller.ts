import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { EnrollmentService } from './enrollment.service';
import { Response, Request } from 'express';
import { Server } from 'socket.io';

const createEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { ...enrollmentData } = req.body;
  const io: Server = req.app.get('io');
  const data = {
    ...enrollmentData,
  };
  const result = await EnrollmentService.createEnrollmentToDB(data, io);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Enrollment created successfully',
    data: result,
  });
});

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.body;
  const result = await EnrollmentService.createPaymentIntent(courseId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Payment intent created successfully',
    data: result,
  });
});
const isEnrolled = catchAsync(async (req: Request, res: Response) => {
  const studentID = req.user.id;
  const courseID = req.params.id;
  const result = await EnrollmentService.isEnrolled(studentID, courseID);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `You are ${result ? 'already enrolled' : 'not enrolled'}.`,
    data: result,
  });
});
export const EnrollmentController = {
  createEnrollment,
  createPaymentIntent,
  isEnrolled,
};
