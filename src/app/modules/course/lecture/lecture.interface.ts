import { Model, ObjectId } from 'mongoose';

export type ILecture = {
  courseID: ObjectId;
  title: string;
  link?: string;
  lectureStatus?: 'complete' | 'incomplete';
  date: Date;
};

export type LectureModel = Model<ILecture>;
