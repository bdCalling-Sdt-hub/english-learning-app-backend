import { Model, ObjectId } from 'mongoose';

export type ILecture = {
  courseID: ObjectId;
  title: string;
  link?: string;
  date: Date;
};

export type LectureModel = Model<ILecture>;
