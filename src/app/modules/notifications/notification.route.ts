// src/routes/notification.route.ts
import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
const router = express.Router();

export const NotificationRoutes = router;
