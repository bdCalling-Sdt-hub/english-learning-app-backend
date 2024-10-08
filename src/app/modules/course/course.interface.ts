import { Model, ObjectId } from 'mongoose';

export type ICourse = {
  name: string;
  banner: string;
  details: string;
  price: number;
  studentRange: number;
  teacherID: string;
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
