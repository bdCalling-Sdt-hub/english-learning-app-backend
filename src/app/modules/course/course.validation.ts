import { z } from 'zod';
import { LANGUAGE } from '../../../enums/language';
const createCourseZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Course Name is required' }),
    details: z.string({ required_error: 'Course Description is required' }),
    banner: z.string().optional(),
    price: z.number({ required_error: 'Course Price is required' }),
    language: z
      .enum([LANGUAGE.ENGLISH, LANGUAGE.HEBREW, LANGUAGE.SPANISH])
      .optional(),
    studentRange: z.number({ required_error: 'Student Range is required' }),

    startTime: z.string({ required_error: 'Start time is required' }),
    endTime: z.string({ required_error: 'End time is required' }),
    startDate: z.string({ required_error: 'Start Date is required' }),
    teacherID: z
      .string({ required_error: 'Teacher ID is required' })
      .optional(),
    lectures: z
      .array(
        z.object({
          title: z.string({ required_error: 'Lecture title is required' }),
          date: z.string({ required_error: 'Lecture date is required' }),
        }),
        { invalid_type_error: 'Lectures must be an array' }
      )
      .optional(),
  }),
});

const updateCourseValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    details: z.string().optional(),
    banner: z.string().optional(),
    price: z.number().optional(),
    startDate: z.string().optional(),
    language: z
      .enum([LANGUAGE.ENGLISH, LANGUAGE.HEBREW, LANGUAGE.SPANISH])
      .optional(),
    studentRange: z.number().optional(),

    startTime: z
      .string({ invalid_type_error: 'startTime should be a string' })
      .optional(),
    endTime: z
      .string({ invalid_type_error: 'endTime should be a string' })
      .optional(),
    teacherID: z
      .string({ required_error: 'Teacher ID is required' })
      .optional(),
    lectures: z
      .array(
        z.object({
          title: z.string().optional(),
          date: z.string().optional(),
        }),
        { invalid_type_error: 'Lectures must be an array' }
      )
      .optional(),
  }),
});
export const CourseValidation = {
  createCourseZodSchema,
  updateCourseValidation,
};
