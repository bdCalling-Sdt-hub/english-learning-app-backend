import { Model, ObjectId } from 'mongoose';

export type IReviews = {
  star: number;
  description: string;
  courseID: string;
  studentID: string;
};

export type ReviewsModel = Model<IReviews>;
