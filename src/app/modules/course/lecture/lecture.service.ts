import { Server } from 'socket.io';
import { NotificationService } from '../../notifications/notification.service';
import { Course } from '../course.model';
import { Lecture } from './lecture.model';
import { USER_ROLES } from '../../../../enums/user';
import { Enrollment } from '../enrollment/enrollment.model';
import ApiError from '../../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';
const getLectureByIDFromDB = async (id: string) => {
  const result = await Lecture.findOne({ _id: id });
  if (!result) {
    throw new Error('Lecture not found');
  }
  return result;
};

const updateLectureToDB = async (id: string, data: any) => {
  const isExistLecture = await Lecture.findOne({ _id: id });
  if (!isExistLecture) {
    throw new Error('Lecture not found');
  }
  const result = await Lecture.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!result) {
    throw new Error('Lecture not updated');
  }

  return result;
};

const updateLectureLinkToDB = async (
  id: string,
  courseID: any,
  link: string,
  io: Server
) => {
  if (!link) {
    throw new Error('Link is required');
  }
  const isExistCourse = await Course.findById(courseID);
  if (!isExistCourse) {
    throw new Error('Course not found');
  }
  const isExistLecture: any = await Lecture.findById(id);
  if (!isExistLecture) {
    throw new Error('Lecture not found');
  }
  const result = await Lecture.findByIdAndUpdate(
    id,
    { link: link },
    {
      new: true,
    }
  );
  if (!result) {
    throw new Error('Lecture not updated');
  }
  const sendNotificationMessage = `Your teacher share a meeting link for lecture "${isExistLecture.title}".`;
  await Promise.all(
    isExistCourse.enrollmentsID.map(async enrollmentID => {
      const enrollment = await Enrollment.findOne({ _id: enrollmentID });
      if (!enrollment) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Enrollment not found');
      }
      const studentID = enrollment?.studentID;
      if (!studentID) {
        throw new Error('Student ID not found');
      }
      await NotificationService.sendNotificationToDB(
        {
          sendTo: USER_ROLES.STUDENT,
          sendUserID: studentID.toString(),
          title: 'New Meeting Link',
          description: sendNotificationMessage,
          status: 'unread' as const,
        },
        io
      );
    })
  );

  return result;
};

const deleteLectureFromDB = async (id: string) => {
  const isExistLecture = await Lecture.findOne({ _id: id });
  if (!isExistLecture) {
    throw new Error('Lecture not found');
  }
  await Course.findOneAndUpdate(
    { _id: isExistLecture.courseID },
    { $pull: { lectures: id } }
  );
  const result = await Lecture.deleteOne({ _id: id });
  if (!result) {
    throw new Error('Lecture not deleted');
  }
  return result;
};

const createLectureToDB = async (data: any) => {
  const isExistCourse = await Course.findOne({ _id: data.courseID });
  if (!isExistCourse) {
    throw new Error('Course not found');
  }
  const result = await Lecture.create(data);
  if (!result) {
    throw new Error('Lecture not created');
  }
  const pushed = await Course.findOneAndUpdate(
    { _id: data.courseID },
    { $push: { lectures: result._id } },
    { new: true }
  );

  if (!pushed) {
    throw new Error('Lecture not created');
  }

  return result;
};

const getUpcomingLectureFromDB = async (id: string) => {
  if (!id) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher ID is required');
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]; // Gets "2024-11-23"

  const courses = await Course.find({ teacherID: id });
  if (!courses || courses.length === 0) {
    return [];
  }

  const upcomingLectures = await Lecture.find({
    courseID: { $in: courses.map(course => course._id) },
    lectureStatus: 'incomplete',
    // Match the exact date string format
    date: today + ' 00:00:00.000Z',
  });

  // Since we're getting exact day matches, we can sort in memory
  const sortedLectures = upcomingLectures.sort((a, b) => {
    const timeA = dayjs(a.date).format('HH:mm');
    const timeB = dayjs(b.date).format('HH:mm');
    return timeA.localeCompare(timeB);
  });

  const result = await Promise.all(
    sortedLectures.map(async lecture => {
      const course = await Course.findById(lecture.courseID);

      return {
        ...lecture.toObject(),
        date: dayjs(lecture.date).format('DD-MM-YYYY'),
        linkSent: lecture.link ? true : false,
        time: dayjs(lecture.date).format('HH:mm'),
        courseName: course?.name,
        courseBanner: course?.banner,
      };
    })
  );

  return result;
};
const completeLectureToDB = async (id: string, io: Server) => {
  const isExistLecture = await Lecture.findOne({ _id: id });
  if (!isExistLecture) {
    throw new Error('Lecture not found');
  }
  const result = await Lecture.findByIdAndUpdate(
    id,
    { lectureStatus: 'complete' },
    {
      new: true,
    }
  );
  if (!result) {
    throw new Error('Lecture not updated');
  }

  return result;
};
export const LectureService = {
  getLectureByIDFromDB,
  updateLectureToDB,
  deleteLectureFromDB,
  createLectureToDB,
  completeLectureToDB,
  updateLectureLinkToDB,
  getUpcomingLectureFromDB,
};
