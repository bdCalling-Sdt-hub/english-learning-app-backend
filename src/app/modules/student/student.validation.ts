import { z } from 'zod';

const createStudentZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    phone: z.string({ required_error: 'Phone Number is required' }),
    password: z.string({ required_error: 'Password is required' }),
    profile: z.string().optional(),
  }),
});

const updateStudentZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    profile: z.string().optional(),
    password: z.string().optional(),
    education: z.string().optional(),
    cardNumber: z.string().optional(),
    dateOfBirth: z.date().optional(),
    status: z.string().optional(),
    gender: z
      .enum(['male', 'female', 'other'], {
        invalid_type_error: 'Gender can only be male, female or other',
      })
      .optional(),

    verified: z.boolean().optional(),
  }),
});

export const StudentValidation = {
  createStudentZodSchema,
  updateStudentZodSchema,
};
