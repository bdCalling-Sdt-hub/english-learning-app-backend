import { Model } from 'mongoose';

export type IComplain = {
  subject: string;
  message: string;
};

export type ComplainModel = Model<IComplain>;
