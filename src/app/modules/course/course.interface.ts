import { Model, ObjectId } from 'mongoose';
import { LANGUAGE } from '../../../enums/language';

export type ICourse = {
  name: string;
  banner: string;
  details: string;
  price: number;
  startTime: string;
  endTime: string;
  language: LANGUAGE.ENGLISH | LANGUAGE.HEBREW | LANGUAGE.SPANISH;
  studentRange: number;
  startDate?: string;
  isApproved?: boolean;
  teacherID?: string;
  gender: 'male' | 'female' | 'other';
  enrollmentsID: Array<string>; // id of the enrollment of this course the enrollment is a seperate model
  lectures?: Array<string>;
  type: 'platform' | 'freelancer';
  time: {
    start: string;
    end: string;
  };
  status: 'active' | 'draft' | 'completed' | 'delete';
};

export type CourseModel = Model<ICourse>;
