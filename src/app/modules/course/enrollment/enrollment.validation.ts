import { z } from 'zod';

const createEnrollmentZodSchema = z.object({
  body: z.object({
    courseID: z.string({ required_error: 'Course ID is required' }),
    studentID: z.string({ required_error: 'Student ID is required' }),
    transactionId: z.string({ required_error: 'Transaction ID is required' }),
  }),
});

export const EnrollmentValidation = {
  createEnrollmentZodSchema,
};
