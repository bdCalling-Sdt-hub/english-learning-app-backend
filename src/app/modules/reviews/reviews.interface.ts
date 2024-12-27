import { Model, ObjectId } from 'mongoose';

export type IReviews = {
  star: number;
  description: string;
  courseID: string;
  teacher: ObjectId;
  studentID: ObjectId;
};

export type ReviewsModel = Model<IReviews>;
