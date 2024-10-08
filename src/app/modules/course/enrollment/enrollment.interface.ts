import { Model, ObjectId } from 'mongoose';

export type IEnrollment = {
  studentID: ObjectId;
  courseID: ObjectId;
  paymentIntentId: string;
};

export type EnrollmentModel = Model<IEnrollment>;
