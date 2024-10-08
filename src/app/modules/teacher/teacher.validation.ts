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
const createStripeAccountZodSchema = z.object({
  dateOfBirth: z.object({
    day: z.number().int().min(1).max(31),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(1900).max(9999),
  }),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  addressLine1: z.string().min(1),
  address: z.object({
    postCode: z.string().min(1),
  }),
  frontFilePart: z.object({
    id: z.string().min(1),
  }),
  backFilePart: z.object({
    id: z.string().min(1),
  }),
  bank_info: z.object({
    account_holder_name: z.string().min(1),
    account_holder_type: z.string().min(1),
    account_number: z.string().min(1),
    country: z.string().min(1),
    currency: z.string().min(1),
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
  createStripeAccountZodSchema,
};
