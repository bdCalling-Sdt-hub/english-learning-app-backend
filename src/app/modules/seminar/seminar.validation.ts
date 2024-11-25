import { z } from 'zod';
import { status } from '../../../enums/user';

const createSeminarValidation = z.object({
  body: z.object({
    title: z.string({ required_error: 'This is required' }),
    description: z.string({ required_error: 'This is required' }),
    time: z.string({ required_error: 'This is required' }),
    duration: z.string({ required_error: 'This is required' }),
    banner: z.string({ required_error: 'This is required' }),
    bookings: z.string().optional(),
  }),
});

const updateSeminarZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    time: z.string().optional(),
    duration: z.string().optional(),
    link: z.string().optional(),
    banner: z.string().optional(),
    bookings: z.string().optional(),
    status: z.enum(['draft', 'published', 'deleted']).optional(),
  }),
});
const bookSeminarZodSchema = z.object({
  body: z.object({
    studentID: z.string({ required_error: 'This is required' }),
    seminarID: z.string({ required_error: 'This is required' }),
  }),
});
export const SeminarValidation = {
  createSeminarValidation,
  updateSeminarZodSchema,
  bookSeminarZodSchema,
};
