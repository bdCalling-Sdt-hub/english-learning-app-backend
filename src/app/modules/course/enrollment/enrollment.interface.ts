import { Model, ObjectId } from 'mongoose';

export type IEnrollment = {
  studentID: ObjectId;
  courseID: ObjectId;
  paymentIntentId: string;
  teacherID?: string;
  teacherPaid?: boolean;
  transactionId?: string;
  // courseCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EnrollmentModel = Model<IEnrollment>;
