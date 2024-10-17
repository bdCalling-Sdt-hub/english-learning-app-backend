import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { Server } from 'socket.io';

// Assuming io is globally accessible, or you can pass it as a parameter to this function
declare const io: Server;

const sendNotificationToDB = async (data: INotification) => {
  // Save the notification in the database
  const notification = await Notification.create(data);

  // Emit the notification to the user in real-time using Socket.IO
  // Use either user ID (sendUserID) or role (sendTo) to identify the recipient
  const roomIdentifier = data.sendUserID || data.sendTo;
  io.to(roomIdentifier).emit('newNotification', notification);

  return notification;
};

const getNotificationsFromDB = async () => {
  // Get all notifications, you can also add filters based on users
  const notifications = await Notification.find({});
  return notifications;
};

export const NotificationService = {
  sendNotificationToDB,
  getNotificationsFromDB,
};
