import { Model, ObjectId } from 'mongoose';
import { LANGUAGE } from '../../../enums/language';

export type ICourse = {
  name: string;
  banner: string;
  details: string;
  price: number;
  language: LANGUAGE.ENGLISH | LANGUAGE.HEBREW | LANGUAGE.SPANISH;
  studentRange: number;
  teacherID: string;
  gender: 'male' | 'female' | 'other';

  enrollmentsID: Array<string>; // id of the enrollment of this course the enrollment is a seperate model
  lectures: Array<string>;
  type: 'platform' | 'freelancer';
  time: {
    start: Date;
    end: Date;
  };
  status: 'active' | 'delete';
};

export type CourseModel = Model<ICourse>;
