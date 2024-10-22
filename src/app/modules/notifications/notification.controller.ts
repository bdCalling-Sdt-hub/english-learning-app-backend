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

const getNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.id;
  const userRole = req.query.role;
  if (!userId || !userRole) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'userId and role is required');
  }
  let result;
  switch (userRole) {
    case USER_ROLES.ADMIN:
      result = await NotificationService.getAdminNotificationsFromDB(
        userId.toString()
      );
      break;
    case USER_ROLES.STUDENT:
      result = await NotificationService.getStudentNotificationsFromDB(
        userId.toString()
      );
      break;
    case USER_ROLES.TEACHER:
      result = await NotificationService.getTeacherNotificationsFromDB(
        userId.toString()
      );
      break;
    default:
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user role');
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

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

const getNotifications = (socket: Socket) => {
  socket.on(
    'getNotifications',
    async (data: {
      userId: string;
      userRole: string;
      page: number;
      limit: number;
    }) => {
      try {
        const { userId, userRole, page, limit } = data;
        let result;
        switch (userRole) {
          case USER_ROLES.ADMIN:
            result = await NotificationService.getAdminNotificationsFromDB(
              userId,
              page,
              limit
            );
            break;
          case USER_ROLES.STUDENT:
            result = await NotificationService.getStudentNotificationsFromDB(
              userId,
              page,
              limit
            );
            break;
          case USER_ROLES.TEACHER:
            result = await NotificationService.getTeacherNotificationsFromDB(
              userId,
              page,
              limit
            );
            break;
          default:
            throw new Error('Invalid user role');
        }
        socket.emit('notifications', result);
      } catch (error) {
        socket.emit('error', { message: 'Failed to retrieve notifications' });
      }
    }
  );
};

const handleWebSocketConnection = (socket: Socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Handle joining rooms for specific users or roles
  socket.on('joinRoom', (room: string) => {
    socket.join(room);
    console.log(`Client joined room: ${room}`);
  });

  // Handle getting notifications
  getNotifications(socket);

  // Handle updating notification status
  socket.on(
    'updateNotificationStatus',
    async (data: { notificationId: string; status: 'read' | 'unread' }) => {
      try {
        const { notificationId, status } = data;
        const updatedNotification =
          await NotificationService.updateNotificationStatus(
            notificationId,
            status
          );
        socket.emit('notificationStatusUpdated', updatedNotification);
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to update notification status',
        });
      }
    }
  );

  socket.on(
    'markNotificationsAsRead',
    async (data: { userId: string; userRole: USER_ROLES }) => {
      try {
        await NotificationService.markNotificationsAsRead(
          data.userId,
          data.userRole
        );
        socket.emit('notificationsMarkedAsRead');
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to mark notifications as read',
        });
      }
    }
  );

  socket.on(
    'reconnect',
    async (data: {
      userId: string;
      userRole: USER_ROLES;
      lastConnectedTime: Date;
    }) => {
      try {
        const missedNotifications =
          await NotificationService.handleReconnection(
            data.userId,
            data.userRole,
            data.lastConnectedTime
          );
        socket.emit('missedNotifications', missedNotifications);
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to retrieve missed notifications',
        });
      }
    }
  );
};
const readNotification = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await NotificationService.readNotification(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification read successfully',
    data: result,
  });
});

const getAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const result = await NotificationService.getAllNotifications(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

const readAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const result = await NotificationService.readAllNotifications(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications read successfully',
    data: result,
  });
});
export const NotificationController = {
  sendNotification,
  readNotification,
  readAllNotifications,
  getNotifications,
  getAllNotifications,
  makeTeacherAppointed,
  handleWebSocketConnection,
};
