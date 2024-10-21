import { z } from 'zod';

const createTeacherZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Firstname is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    phone: z.string({ required_error: 'phoneNumber is required' }),
  }),
});
const createStripeAccountZodSchema = z.object({
  body: z.object({
    dateOfBirth: z
      .object({
        day: z.number().int().min(1).max(31).optional(),
        month: z.number().int().min(1).max(12).optional(),
        year: z.number().int().min(1900).max(9999).optional(),
      })
      .required(),
    id: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    addressLine1: z.string().optional(),
    address: z
      .object({
        postCode: z.string().optional(),
      })
      .optional(),
    frontFilePart: z
      .object({
        id: z.string().optional(),
      })
      .optional(),
    backFilePart: z
      .object({
        id: z.string().optional(),
      })
      .optional(),
    bank_info: z
      .object({
        account_holder_name: z.string().optional(),
        account_holder_type: z.string().optional(),
        account_number: z.string().optional(),
        country: z.string().optional(),
        currency: z.string().optional(),
      })
      .optional(),
  }),
});

const addEducationZodSchema = z.object({
  body: z.object({
    degree: z.string(),
    institute: z.string(),
  }),
});

export const TeacherValidation = {
  createTeacherZodSchema,
  createStripeAccountZodSchema,
  addEducationZodSchema,
};
