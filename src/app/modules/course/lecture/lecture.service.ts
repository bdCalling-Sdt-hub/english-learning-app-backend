import { Course } from '../course.model';
import { Lecture } from './lecture.model';

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

const deleteLectureFromDB = async (id: string) => {
  const isExistLecture = await Lecture.findOne({ _id: id });
  if (!isExistLecture) {
    throw new Error('Lecture not found');
  }
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

export const LectureService = {
  getLectureByIDFromDB,
  updateLectureToDB,
  deleteLectureFromDB,
  createLectureToDB,
};
