import { Request, Response } from 'express';
import { ISeminar } from './seminar.interface';
import { Seminar } from './seminar.model';
import { Teacher } from '../teacher/teacher.model';
import { SeminarValidation } from './seminar.validation';
import { Server } from 'socket.io';
import { NotificationService } from '../notifications/notification.service';
import { USER_ROLES } from '../../../enums/user';
import { Student } from '../student/student.model';

const createSeminarToDB = async (data: ISeminar, io: Server) => {
  const validateData = {
    body: {
      ...data,
    },
  };
  await SeminarValidation.createSeminarValidation.parseAsync(validateData);

  const result = await Seminar.create(data);
  const isExistTeacher = await Teacher.findById(data.teacherID);
  if (!isExistTeacher) {
    throw new Error('Teacher not found');
  }
  if (!result) {
    throw new Error('Seminar not created');
  }
  const message = `${isExistTeacher.name} has created a new seminar.`;
  const seminarData = {
    teacherID: data.teacherID,
    seminarID: result._id,
  };
  const notificationSent =
    await NotificationService.sendNotificationToAllUserOfARole(
      message,
      io,
      USER_ROLES.STUDENT,
      seminarData
    );

  if (!notificationSent) {
    throw new Error('Notification not sent');
  }

  return result;
};

const updateSeminarToDB = async (id: string, data: any) => {
  const isExistSeminar = await Seminar.findById(id);
  if (!isExistSeminar) {
    throw new Error('Seminar not found');
  }
  const result = await Seminar.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!result) {
    throw new Error('Seminar not updated');
  }
  return result;
};

const deleteSeminarFromDB = async (id: string): Promise<any> => {
  const isExistSeminar = await Seminar.findById(id);
  if (!isExistSeminar) {
    throw new Error('Seminar not found');
  }
  const result = await Seminar.findByIdAndUpdate(
    id,
    { status: 'delete' },
    {
      new: true,
    }
  );
  if (!result) {
    throw new Error('Seminar not deleted');
  }
  return result;
};

const getAllSeminarFromDB = async () => {
  const result = await Seminar.find({ status: 'published' });
  if (!result) {
    throw new Error('Seminar not found');
  }
  return result;
};

const getSeminarByIdFromDB = async (id: string) => {
  const result = await Seminar.findById(id);
  if (!result) {
    throw new Error('Seminar not found');
  }
  return result;
};

const getSeminarByTeacherIdFromDB = async (id: string) => {
  const result = await Seminar.find({ teacherID: id });
  if (!result) {
    throw new Error('Seminar not found');
  }
  return result;
};

const bookSeminarToDB = async (Data: any, io: Server) => {
  const isExistStudent = await Student.findOne({ _id: Data.studentID });
  if (!isExistStudent) {
    throw new Error('Student not found');
  }
  const isExistSeminar = await getSeminarByIdFromDB(Data.seminarID);
  if (!isExistSeminar) {
    throw new Error('Seminar not found');
  }
  const bookingsArray = isExistSeminar.bookings as string[];
  if (bookingsArray.includes(isExistStudent._id.toString())) {
    throw new Error('Seminar already booked');
  }
  const result = await Seminar.findOneAndUpdate(
    { _id: Data.seminarID },
    { $push: { bookings: Data.studentID } },
    { new: true }
  );
  if (!result) {
    throw new Error('Seminar not booked');
  }
  const message = `${isExistStudent.name} has booked a seminar.`;
  const sendData = {
    sendTo: USER_ROLES.TEACHER,
    sendUserID: isExistSeminar.teacherID,
    message: message,
    data: { seminarID: Data.seminarID },
  };
  const notificationSent = await NotificationService.sendNotificationToDB(
    sendData,
    io
  );
  if (!notificationSent) {
    throw new Error('Notification not sent');
  }
  return result;
};

const completeSeminarFromDB = async (id: string): Promise<any> => {
  const result = await Seminar.findByIdAndUpdate(
    id,
    { status: 'completed' },
    { new: true }
  );
  if (!result) {
    throw new Error('Seminar not completed');
  }
  return result;
};

export const seminarService = {
  createSeminarToDB,
  updateSeminarToDB,
  deleteSeminarFromDB,
  getAllSeminarFromDB,
  getSeminarByIdFromDB,
  getSeminarByTeacherIdFromDB,
  bookSeminarToDB,
  completeSeminarFromDB,
};
