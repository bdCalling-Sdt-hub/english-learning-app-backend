import { z } from 'zod';
import { AdminTypes } from '../../../enums/user';

const createAdminZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const createSuperAdminValidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    type: z.string().default(AdminTypes.SUPERADMIN).optional(),
  }),
});

export const AdminValidation = {
  createAdminZodSchema,
  createSuperAdminValidation,
};
