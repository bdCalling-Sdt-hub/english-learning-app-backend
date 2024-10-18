// src/routes/notification.route.ts
import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
const router = express.Router();

// Route to send a notification
router.post(
  '/send',
  // auth(
  //   USER_ROLES.ADMIN,
  //   USER_ROLES.STUDENT,
  //   USER_ROLES.TEACHER,
  //   AdminTypes.SUPERADMIN
  // ),
  NotificationController.sendNotification
);

// Route to get all notifications
router.get(
  '/get',
  // auth(
  //   USER_ROLES.ADMIN,
  //   USER_ROLES.STUDENT,
  //   USER_ROLES.TEACHER,
  //   AdminTypes.SUPERADMIN
  // ),
  NotificationController.getNotifications
);

export const NotificationRoutes = router;
