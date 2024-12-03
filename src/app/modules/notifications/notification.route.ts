// src/routes/notification.route.ts
import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { NotificationValidation } from './notification.validation';
const router = express.Router();

router.post(
  '/',
  auth(
    USER_ROLES.ADMIN,
    AdminTypes.SUPERADMIN,
    USER_ROLES.STUDENT,
    USER_ROLES.TEACHER
  ),
  validateRequest(NotificationValidation.sendNotificationZodSchema),
  NotificationController.sendNotification
);

router.get(
  '/all',
  auth(
    USER_ROLES.ADMIN,
    AdminTypes.SUPERADMIN,
    USER_ROLES.STUDENT,
    USER_ROLES.TEACHER
  ),
  NotificationController.getNotifications
);
router.patch(
  '/mark-all',
  auth(
    USER_ROLES.ADMIN,
    AdminTypes.SUPERADMIN,
    USER_ROLES.STUDENT,
    USER_ROLES.TEACHER
  ),
  NotificationController.markNotificationsAsRead
);
router.patch('/mark/:id', NotificationController.markNotificationAsRead);

export const NotificationRoutes = router;
