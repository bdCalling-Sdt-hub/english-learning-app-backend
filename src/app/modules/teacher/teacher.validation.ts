import { z } from 'zod';

const createTeacherZodSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'Name is required' }),
    lastName: z.string({ required_error: 'Name is required' }),
    email: z
      .string()
      .email({ message: 'Invalid email format' }) // Email format validation
      .nonempty({ message: 'Email is required' }), // Ensures email is not empty
    dateOfBirth: z
      .object({
        year: z.number({ required_error: 'Year is required' }),
        month: z.number({ required_error: 'Month is required' }),
        day: z.number({ required_error: 'Day is required' }),
      })
      .optional(),
    city: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    postCode: z.string().optional(),
    state: z.string().optional(),
    idNumber: z.string().optional(),
    ip: z.string().optional(),
    ssnLast4: z.string().optional(),
    phone: z
      .string()
      .nonempty({ message: 'Phone Number is required' }) // Ensures phone number is not empty
      .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' }), // Basic international phone number validation
    stripeAccountId: z.string().optional(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }) // Minimum length for password
      .nonempty({ message: 'Password is required' }),
    profile: z.string().optional(),
  }),
});
const updateTeacherZodSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().optional(),
    profile: z.string().optional(),
    location: z.string().optional(),
    status: z.string().optional(),
    verified: z.boolean().optional(),
    country: z.string().optional(),
    gender: z
      .enum(['male', 'female', 'other'], {
        invalid_type_error: 'Gender can only be male, female or other',
      })
      .optional(),
    dateOfBirth: z.date().optional(),
    designation: z.string().optional(),

    experience: z.number().optional(),
    education: z.array(z.string()).optional(),
  }),
});

export const TeacherValidation = {
  createTeacherZodSchema,
  updateTeacherZodSchema,
};
