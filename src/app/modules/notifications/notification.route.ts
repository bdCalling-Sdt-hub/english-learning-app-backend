// src/routes/notification.route.ts
import express from 'express';
import { NotificationController } from './notification.controller';
const router = express.Router();

// Route to send a notification
router.post('/send', NotificationController.sendNotification);

// Route to get all notifications
router.get('/', NotificationController.getNotification);

export const NotificationRoutes = router;
