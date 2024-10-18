import { z } from 'zod';
import { AdminTypes, USER_ROLES } from '../../../enums/user';

const sendNotificationZodSchema = z.object({
  sendTo: z.enum([
    USER_ROLES.STUDENT,
    USER_ROLES.TEACHER,
    USER_ROLES.ADMIN,
    AdminTypes.SUPERADMIN,
  ]),
  sendUserID: z.string(),
  message: z.string(),
  status: z.enum(['unread', 'read']),
});

export const NotificationValidation = {
  sendNotificationZodSchema,
};
