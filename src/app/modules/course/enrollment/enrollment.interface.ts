import { Model, ObjectId } from 'mongoose';

export type IEnrollment = {
  studentID: ObjectId;
  courseID: ObjectId;
  paymentIntentId: string;
  teacherID?: string;
};

export type EnrollmentModel = Model<IEnrollment>;
