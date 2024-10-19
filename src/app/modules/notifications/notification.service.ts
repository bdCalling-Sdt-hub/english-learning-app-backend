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

const sendNotificationToDB = async (data: INotification, io: Server) => {
  try {
    if (!data.sendTo || !data.sendUserID || !data.message) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'sendTo, sendUserID and message are required'
      );
    }
    const notification = await Notification.create(data);
    if (!notification) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to send notification'
      );
    }
    const roomIdentifier = data.sendUserID;
    let eventName;
    switch (data.sendTo) {
      case USER_ROLES.TEACHER:
        eventName = SOCKET_EVENTS.TEACHER.SPECIFIC;
        break;
      case USER_ROLES.STUDENT:
        eventName = SOCKET_EVENTS.STUDENT.SPECIFIC;
        break;
      case USER_ROLES.ADMIN:
        eventName = SOCKET_EVENTS.ADMIN.SPECIFIC;
        break;
      case AdminTypes.SUPERADMIN:
        eventName = SOCKET_EVENTS.ADMIN.SPECIFIC;
        break;
      default:
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user role');
    }
    io.emit(`${eventName}::${roomIdentifier}`, notification);
    return notification;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to send notification'
    );
  }
};

const sendNotificationToAllUserOfARole = async (
  message: string,
  io: Server,
  role: string,
  batchSize = 1000
) => {
  try {
    let User;
    let Event;
    switch (role) {
      case USER_ROLES.STUDENT:
        User = Student;
        Event = SOCKET_EVENTS.STUDENT.ALL;
        break;
      case USER_ROLES.TEACHER:
        User = Teacher;
        Event = SOCKET_EVENTS.TEACHER.ALL;
        break;
      case USER_ROLES.ADMIN:
        User = Admin;
        Event = SOCKET_EVENTS.ADMIN.ALL;
        break;
      case AdminTypes.SUPERADMIN:
        User = Admin;
        Event = SOCKET_EVENTS.ADMIN.ALL;
        break;
      default:
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user role');
    }

    const totalUsers = await User.countDocuments();
    let processedUsers = 0;

    while (processedUsers < totalUsers) {
      // @ts-ignore
      const users = await User.find({}, '_id')
        .skip(processedUsers)
        .limit(batchSize);
      // @ts-ignore
      const notifications = users.map(user => ({
        sendTo: role.toUpperCase(),
        sendUserID: user._id.toString(),
        message,
        status: 'unread' as const,
      }));

      const createdNotifications = await Notification.insertMany(notifications);

      createdNotifications.forEach(notification => {
        io.emit(Event as string, notification);
      });

      processedUsers += users.length;
    }

    console.log(`Notifications sent to ${totalUsers} ${role} users`);
    return { message: `Notifications sent to ${totalUsers} students` };
  } catch (error) {
    console.error(error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to send notifications to all ${role} users`
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
    io.emit(`newNotification::${teacherId}`, notification);

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
        io.emit('newStudentNotification', notification);
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
  sendNotificationToAllUserOfARole,
  sendNotificationToAllStudents,
  sendNotificationToTeacher,
  updateNotificationStatus,
  markNotificationsAsRead,
  handleReconnection,
  limitStoredNotifications,
  clearOldNotifications,
};
