import { z } from 'zod';
const createReviewsZodSchema = z.object({
  body: z.object({
    star: z.string({ required_error: 'star is required' }),
    description: z.string({ required_error: 'description is required' }),
    courseID: z.string({ required_error: 'courseID is required' }),
    studentID: z.string({ required_error: 'studentID is required' }),
  }),
});

export const ReviewValidation = {
  createReviewsZodSchema,
};
