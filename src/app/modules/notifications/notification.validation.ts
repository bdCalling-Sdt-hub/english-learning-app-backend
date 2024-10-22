import { z } from 'zod';
import { AdminTypes, USER_ROLES } from '../../../enums/user';

const sendNotificationZodSchema = z.object({
  sendTo: z.enum(
    [
      USER_ROLES.STUDENT,
      USER_ROLES.TEACHER,
      USER_ROLES.ADMIN,
      AdminTypes.SUPERADMIN,
    ],
    { required_error: 'sendTo is required' }
  ),
  sendUserID: z.string({ required_error: 'sendUserID is required' }),
  message: z.string({ required_error: 'message is required' }),
  status: z.enum(['unread', 'read']).optional(),
});

export const NotificationValidation = {
  sendNotificationZodSchema,
};
