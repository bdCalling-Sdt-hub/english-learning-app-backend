import { Server } from 'socket.io';
import { Course } from '../course/course.model';
import { Enrollment } from '../course/enrollment/enrollment.model';
import { NotificationService } from '../notifications/notification.service';
import { Student } from '../student/student.model';
import { Teacher } from '../teacher/teacher.model';
import { Complain } from './complain.model';
import { USER_ROLES } from '../../../enums/user';

const createComplainToDB = async (data: any, io: Server) => {
  const result = await Complain.create(data);
  const isExistTeacher = await Teacher.findOne({ _id: data.teacherID });
  if (!isExistTeacher) {
    throw new Error('Teacher not found');
  }
  const isExistStudent = await Student.findOne({ _id: data.studentID });
  if (!isExistStudent) {
    throw new Error('Student not found');
  }
  const isExistEnrollment = await Enrollment.findOne({
    studentID: data.studentID,
  });
  if (!isExistEnrollment) {
    throw new Error('Enrollment not found');
  }
  const course = await Course.findOne({ _id: isExistEnrollment.courseID });
  if (!course) {
    throw new Error('Course not found');
  }
  const isExistTeacherEnrollment = await Teacher.findOne({
    _id: course?.teacherID,
  });
  if (!isExistTeacherEnrollment) {
    throw new Error('Teacher not found');
  }
  if (!result) {
    throw new Error('Complain not created');
  }
  const message = `${isExistStudent.name} has raised a complain.`;
  await NotificationService.sendNotificationToDB(
    {
      sendTo: USER_ROLES.TEACHER,
      sendUserID: isExistTeacherEnrollment._id.toString(),
      title: 'Complain Raised',
      description: message,
      data: { complainID: result._id.toString() },
    },
    io
  );
  await NotificationService.sendNotificationToAllUsersOfARole(
    USER_ROLES.ADMIN,
    {
      sendTo: USER_ROLES.ADMIN,
      title: 'Complain Raised',
      description: message,
      data: { complainID: result._id.toString() },
    },
    io
  );
  return result;
};

const getComplainByIdFromDB = async (id: string) => {
  const result = await Complain.findById(id);
  if (!result) {
    throw new Error('Complain not found');
  }
  return result;
};

const getAllComplainsFromDB = async () => {
  const result = await Complain.find();
  if (!result) {
    throw new Error('Complains not found');
  }
  return result;
};
const getEnrolledTeachersFromDB = async (email: string) => {
  // Find the student by email
  const isExistStudent = await Student.findOne({ email: email });
  if (!isExistStudent) {
    throw new Error('Student not found');
  }

  // Find all enrollments for the student
  const enrollments = await Enrollment.find({ studentID: isExistStudent._id });
  if (!enrollments || enrollments.length === 0) {
    throw new Error('Enrollment not found');
  }

  // Fetch all courses based on the enrollments
  const courseIDs = enrollments.map(enrollment => enrollment.courseID);
  const courses = await Course.find({ _id: { $in: courseIDs } });
  if (!courses || courses.length === 0) {
    throw new Error('Courses not found');
  }

  // Fetch all teacher IDs from the courses
  const teacherIDs = courses.map(course => course.teacherID);

  // Fetch teacher details (if needed) or just return the teacher IDs
  const teachers = await Teacher.find({ _id: { $in: teacherIDs } });

  return teachers; // This will return the array of teacher objects
};

export const complainService = {
  createComplainToDB,
  getComplainByIdFromDB,
  getAllComplainsFromDB,
  getEnrolledTeachersFromDB,
};
