import { Model, ObjectId } from 'mongoose';

export type ISeminar = {
  title: string;
  description: string;
  time: string;
  duration: string;
  teacherID: string;
  link: string;
  banner: string;
  bookings: [string];
  status: 'draft' | 'published' | 'deleted';
};

export type SeminarModel = Model<ISeminar>;
