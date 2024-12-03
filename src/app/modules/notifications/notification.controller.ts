import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../../errors/ApiError';
import { NotificationService } from './notification.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../../../enums/user';
import { Server, Socket } from 'socket.io';
import { AdminService } from '../admin/admin.service';

const sendNotification = catchAsync(async (req: Request, res: Response) => {
  const { ...data } = req.body;
  const io: Server = req.app.get('io');
  const result = await NotificationService.sendNotificationToDB(data, io);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification sent successfully',
    data: result,
  });
});

const sendNotificationToAllUsersOfARole = catchAsync(
  async (req: Request, res: Response) => {
    const role = req.params.role;
    const { ...data } = req.body;
    const io: Server = req.app.get('io');
    const result = await NotificationService.sendNotificationToAllUsersOfARole(
      role,
      data,
      io
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notification sent successfully',
      data: result,
    });
  }
);

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const userId = req.user.id;
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const result = await NotificationService.getNotificationsFromDB(
    userId,
    page,
    limit
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    pagination: {
      currentPage: page,
      limit,
      totalPage: Math.ceil(result.total / limit),
      total: result.notifications.length,
    },
    message: 'Notifications retrieved successfully',
    data: result.notifications,
  });
});

const readNotification = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await NotificationService.readNotification(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification read successfully',
    data: result,
  });
});

const markNotificationsAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user.id;
    const result = await NotificationService.markNotificationsAsRead(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notifications marked as read successfully',
      data: result,
    });
  }
);
const markNotificationAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await NotificationService.readNotification(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Notification marked as read successfully',
      data: result,
    });
  }
);

export const NotificationController = {
  sendNotification,
  sendNotificationToAllUsersOfARole,
  getNotifications,
  readNotification,
  markNotificationsAsRead,
  markNotificationAsRead,
};
