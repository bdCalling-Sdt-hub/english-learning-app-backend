import { z } from 'zod';
const createCourseZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Course Name is required' }),
    details: z.string({ required_error: 'Course Description is required' }),
    banner: z.string().optional(),
    price: z.number({ required_error: 'Course Price is required' }),
    studentRange: z.number({ required_error: 'Student Range is required' }),
    duration: z
      .string({ required_error: 'Course Duration is required' })
      .regex(/^[0-9]+(m|h|d|w)$/, { message: 'Invalid duration format' }),
    time: z.object({
      start: z.string({ required_error: 'Start time is required' }),
      end: z.string({ required_error: 'End time is required' }),
    }),
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
    studentRange: z.number().optional(),
    duration: z
      .string({ required_error: 'Course Duration is required' })
      .regex(/^[0-9]+(m|h|d|w)$/, { message: 'Invalid duration format' })
      .optional(),
    time: z
      .object({
        start: z.string({ required_error: 'Start time is required' }),
        end: z.string({ required_error: 'End time is required' }),
      })
      .optional(),
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
export const CourseValidation = {
  createCourseZodSchema,
  updateCourseValidation,
};
