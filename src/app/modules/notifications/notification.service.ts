import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Server } from 'socket.io';
import { Student } from '../student/student.model';
import { Teacher } from '../teacher/teacher.model';
import { SOCKET_EVENTS } from '../../../shared/socketEvents';
import { Admin } from '../admin/admin.model';
const sendNotificationToDB = async (
  data: INotification,
  io: Server
): Promise<INotification> => {
  try {
    const notification = await Notification.create(data);
    io.emit(
      `${SOCKET_EVENTS.NEW_NOTIFICATION}::${data.sendUserID}`,
      notification
    );
    return notification;
  } catch (error) {
    console.log(error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to send notification'
    );
  }
};
const sendNotificationToAllUsersOfARole = async (
  role: string,
  data: INotification,
  io: Server
) => {
  try {
    const allUsers =
      role == USER_ROLES.ADMIN
        ? await Admin.find()
        : role == USER_ROLES.STUDENT
        ? await Student.find()
        : await Teacher.find();
    const sentNotifications = await Promise.all(
      allUsers.map(user => {
        sendNotificationToDB(data, io);
        io.emit(`${SOCKET_EVENTS.NEW_NOTIFICATION}::${user._id}`, data);
        return data;
      })
    );
    if (!sentNotifications) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to send notification'
      );
    }
    return sentNotifications;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to send notification'
    );
  }
};
const handleReconnection = async (
  userId: string,
  userRole: USER_ROLES,
  lastConnectedTime: Date,
  io: Server
) => {
  try {
    const missedNotifications = await Notification.find({
      sendUserID: userId,
      sendTo: userRole,
      createdAt: { $gt: lastConnectedTime },
    }).sort({ createdAt: -1 });
    return missedNotifications;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve missed notifications'
    );
  }
};
const getNotificationsFromDB = async (
  userId: string,
  page: number,
  limit: number
) => {
  try {
    const notifications = await Notification.find({
      sendUserID: userId,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Notification.countDocuments({
      sendUserID: userId,
    });
    return {
      notifications,
      total,
    };
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve notifications'
    );
  }
};
const readNotification = async (id: string) => {
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
    }
    notification.status = 'read';
    await notification.save();
    return notification;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to read notification'
    );
  }
};
const markNotificationsAsRead = async (userId: string) => {
  try {
    const notifications = await Notification.updateMany(
      {
        sendUserID: userId,
        status: 'unread',
      },
      { status: 'read' }
    );
    return notifications;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to mark notifications as read'
    );
  }
};
export const NotificationService = {
  handleReconnection,
  sendNotificationToDB,
  sendNotificationToAllUsersOfARole,
  getNotificationsFromDB,
  readNotification,
  markNotificationsAsRead,
};
