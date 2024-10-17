import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { NotificationService } from './notification.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const sendNotification = catchAsync(async (req: Request, res: Response) => {
  const { ...data } = req.body;
  const result = await NotificationService.sendNotificationToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification sent successfully',
    data: result,
  });
});

const getNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getNotificationsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

export const NotificationController = {
  sendNotification,
  getNotification,
};
