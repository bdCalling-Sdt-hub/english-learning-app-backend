// src/routes/notification.route.ts
import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { NotificationValidation } from './notification.validation';
const router = express.Router();

router.post(
  '/send',
  auth(
    USER_ROLES.ADMIN,
    AdminTypes.SUPERADMIN,
    USER_ROLES.TEACHER,
    USER_ROLES.STUDENT
  ),
  validateRequest(NotificationValidation.sendNotificationZodSchema),
  NotificationController.sendNotification
);

router.post(
  '/read/:id',
  auth(
    USER_ROLES.ADMIN,
    AdminTypes.SUPERADMIN,
    USER_ROLES.TEACHER,
    USER_ROLES.STUDENT
  ),
  NotificationController.readNotification
);
router.post(
  '/read-all',
  auth(
    USER_ROLES.ADMIN,
    AdminTypes.SUPERADMIN,
    USER_ROLES.TEACHER,
    USER_ROLES.STUDENT
  ),
  NotificationController.readAllNotifications
);
router.get(
  '/all',
  auth(
    USER_ROLES.ADMIN,
    AdminTypes.SUPERADMIN,
    USER_ROLES.TEACHER,
    USER_ROLES.STUDENT
  ),
  NotificationController.getAllNotifications
);
export const NotificationRoutes = router;
