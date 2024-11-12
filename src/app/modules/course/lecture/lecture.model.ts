import { model, Schema } from 'mongoose';
import { ILecture, LectureModel } from './lecture.interface';

const lectureSchema = new Schema<ILecture, LectureModel>(
  {
    courseID: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
    },
    link: {
      type: String,
      required: false,
    },
    lectureStatus: {
      type: String,
      enum: ['complete', 'incomplete'],
      default: 'incomplete',
      required: false,
    },
    date: {
      type: String,
      required: [true, 'Lecture date is required'],
    },
  },
  { timestamps: true }
);

export const Lecture = model<ILecture, LectureModel>('Lecture', lectureSchema);
