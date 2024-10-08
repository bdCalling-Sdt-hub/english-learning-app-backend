import { z } from 'zod';

const createLectureZodSchema = z.object({
  body: z.object({
    courseID: z.string({ required_error: 'Course ID is required' }),
    title: z.string({ required_error: 'Lecture title is required' }),
    date: z.string({ required_error: 'Lecture date is required' }),
  }),
});

const updateLectureZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    date: z.string().optional(),
  }),
});

export const LectureValidation = {
  createLectureZodSchema,
  updateLectureZodSchema,
};
