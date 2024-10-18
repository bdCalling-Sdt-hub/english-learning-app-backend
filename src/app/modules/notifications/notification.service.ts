import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Server } from 'socket.io';
import { Student } from '../student/student.model';

const sendNotificationToDB = async (data: INotification, io: Server) => {
  try {
    const notification = await Notification.create(data);
    if (!notification) {
      console.log('notification not found');
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to send notification'
      );
    }
    const roomIdentifier = data.sendUserID;
    io.emit(`newNotification::${roomIdentifier}`, notification);
    return notification;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to send notification'
    );
  }
};
const sendNotificationToTeacher = async (
  teacherId: string,
  message: string,
  io: Server
) => {
  try {
    const notificationData = {
      sendTo: USER_ROLES.TEACHER,
      sendUserID: teacherId,
      message,
      status: 'unread' as const,
    };

    const notification = await Notification.create(notificationData);
    io.to(teacherId).emit('newNotification', notification);

    return notification;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to send notification to teacher'
    );
  }
};
const getAdminNotificationsFromDB = async (
  adminId: string,
  page = 1,
  limit = 20
) => {
  try {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({
      $or: [{ sendUserID: adminId }, { sendTo: USER_ROLES.ADMIN }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return notifications;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve admin notifications'
    );
  }
};

const getStudentNotificationsFromDB = async (
  studentId: string,
  page = 1,
  limit = 20
) => {
  try {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({
      $or: [{ sendUserID: studentId }, { sendTo: USER_ROLES.STUDENT }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return notifications;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve student notifications'
    );
  }
};

const getTeacherNotificationsFromDB = async (
  teacherId: string,
  page = 1,
  limit = 20
) => {
  try {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({
      $or: [{ sendUserID: teacherId }, { sendTo: USER_ROLES.TEACHER }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return notifications;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to retrieve teacher notifications'
    );
  }
};
const sendNotificationToAllStudents = async (
  message: string,
  io: Server,
  batchSize = 1000
) => {
  try {
    const totalStudents = await Student.countDocuments();
    let processedStudents = 0;

    while (processedStudents < totalStudents) {
      const students = await Student.find({}, '_id')
        .skip(processedStudents)
        .limit(batchSize);

      const notifications = students.map(student => ({
        sendTo: USER_ROLES.STUDENT,
        sendUserID: student._id.toString(),
        message,
        status: 'unread' as const,
      }));

      const createdNotifications = await Notification.insertMany(notifications);

      createdNotifications.forEach(notification => {
        io.emit('newNotification', notification);
      });

      processedStudents += students.length;
    }

    return { message: `Notifications sent to ${totalStudents} students` };
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to send notifications to all students'
    );
  }
};
const updateNotificationStatus = async (
  notificationId: string,
  status: 'read' | 'unread'
) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { status },
      { new: true }
    );
    if (!updatedNotification) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
    }
    return updatedNotification;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update notification status'
    );
  }
};

const markNotificationsAsRead = async (
  userId: string,
  userRole: USER_ROLES
) => {
  try {
    await Notification.updateMany(
      { sendUserID: userId, sendTo: userRole, status: 'unread' },
      { status: 'read' }
    );
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to mark notifications as read'
    );
  }
};

const handleReconnection = async (
  userId: string,
  userRole: USER_ROLES,
  lastConnectedTime: Date
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

const limitStoredNotifications = async (
  userId: string,
  userRole: USER_ROLES,
  limit: number
) => {
  try {
    const count = await Notification.countDocuments({
      sendUserID: userId,
      sendTo: userRole,
    });
    if (count > limit) {
      const notificationsToDelete = count - limit;
      await Notification.find({ sendUserID: userId, sendTo: userRole })
        .sort({ createdAt: 1 })
        .limit(notificationsToDelete)
        .deleteMany();
    }
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to limit stored notifications'
    );
  }
};

const clearOldNotifications = async (daysOld: number) => {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysOld);
    await Notification.deleteMany({ createdAt: { $lt: dateThreshold } });
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to clear old notifications'
    );
  }
};

export const NotificationService = {
  sendNotificationToDB,
  getAdminNotificationsFromDB,
  getStudentNotificationsFromDB,
  getTeacherNotificationsFromDB,
  sendNotificationToAllStudents,
  sendNotificationToTeacher,
  updateNotificationStatus,
  markNotificationsAsRead,
  handleReconnection,
  limitStoredNotifications,
  clearOldNotifications,
};
