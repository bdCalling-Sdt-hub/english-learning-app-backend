import { model, Schema } from 'mongoose';
import { ComplainModel, IComplain } from './complain.interface';

const complainSchema = new Schema<IComplain, ComplainModel>(
  {
    studentID: {
      type: String,
      required: true,
    },

    teacherID: {
      type: String,
      required: [true, 'This is required'],
    },
    message: {
      type: String,
      required: [true, 'This is required'],
    },
  },
  { timestamps: true }
);

export const Complain = model<IComplain, ComplainModel>(
  'Complains',
  complainSchema
);
