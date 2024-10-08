import { Model, ObjectId } from 'mongoose';

export type ILecture = {
  courseID: ObjectId;
  title: string;
  date: Date;
};

export type LectureModel = Model<ILecture>;
