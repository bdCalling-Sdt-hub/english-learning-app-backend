import { Model } from 'mongoose';

export type IComplain = {
  studentID: string;
  teacherID: string;
  message: string;
};

export type ComplainModel = Model<IComplain>;
