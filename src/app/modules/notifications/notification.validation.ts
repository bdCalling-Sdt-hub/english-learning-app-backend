import { z } from 'zod';
import { AdminTypes, USER_ROLES } from '../../../enums/user';

const sendNotificationZodSchema = z.object({
  body: z.object({
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
    title: z.string({ required_error: 'title is required' }),
    description: z.string({ required_error: 'description is required' }),
    status: z.enum(['unread', 'read']).optional(),
  }),
});

export const NotificationValidation = {
  sendNotificationZodSchema,
};
