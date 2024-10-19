import { Model, ObjectId } from 'mongoose';

export type ISeminar = {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  teacherID: string;
  link: string;
  banner: string;
  bookings: [string];
  status: 'draft' | 'published' | 'completed' | 'deleted';
};

export type SeminarModel = Model<ISeminar>;
