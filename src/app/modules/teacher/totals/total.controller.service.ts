import { Course } from '../../course/course.model';
import { Enrollment } from '../../course/enrollment/enrollment.model';
import { Reviews } from '../../reviews/reviews.model';
import { Student } from '../../student/student.model';
import { Teacher } from '../teacher.model';
import { startOfMonth, endOfMonth } from 'date-fns';

const getOverallRating = async (id: string) => {
  const isExistTeacher = await Teacher.isExistTeacherById(id);

  if (!isExistTeacher) {
    throw new Error("Teacher doesn't exist");
  }
  const courses: any = await Course.find({
    teacherID: id,
  });
  if (!courses) {
    throw new Error('Course not found');
  }
  const reviews = await Reviews.find({
    courseID: { $in: courses.map((course: any) => course._id) },
  })
    .select('star')
    .lean();
  console.log(reviews);

  if (!reviews) {
    throw new Error('Reviews not found');
  }

  let totalstar = 0;

  reviews.forEach(review => {
    totalstar += review.star;
  });
  const avarageRating = totalstar / reviews.length;
  let totalEnrollments: number = 0;
  courses.forEach((course: any) => {
    totalEnrollments = totalEnrollments + course.enrollmentsID.length;
  });
  return {
    avarageRating: avarageRating,
    totalRatings: reviews.length,
    totalCourseTaker: totalEnrollments,
  };
};

const getEarnings = async (id: string) => {
  const teacher = await Teacher.findById(id);
  if (!teacher) {
    throw new Error('Teacher not found');
  }

  const currentDate = new Date();
  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);

  // Get all enrollments for the teacher
  const enrollments = await Enrollment.find({
    teacherID: id,
  }).populate('courseID');

  let monthlyIncome = 0;
  let pendingIncome = 0;
  let totalIncome = teacher.earnings || 0;

  for (const enrollment of enrollments) {
    const course = enrollment.courseID as any; // Type assertion due to population
    if (!course) {
      console.warn(`Course not found for enrollment ${enrollment._id}`);
      continue;
    }

    const teacherShare = course.price * 0.8; // Assuming 80% goes to the teacher

    // Check if the enrollment is from the current month
    if (
      enrollment?.createdAt &&
      enrollment?.createdAt >= startOfCurrentMonth &&
      enrollment?.createdAt <= endOfCurrentMonth
    ) {
      monthlyIncome += teacherShare;
    }

    // Check if the payment is pending
    if (!enrollment.teacherPaid) {
      pendingIncome += teacherShare;
    }
  }

  return {
    monthlyEarnings: Number(monthlyIncome.toFixed(2)),
    totalEarnings: Number(totalIncome.toFixed(2)),
    // pendingEarnings: Number(pendingIncome.toFixed(2)),
  };
};
const getCourseStatus = async (id: string) => {
  const teacher = await Teacher.findById(id);
  if (!teacher) {
    throw new Error('Teacher not found');
  }
  const courses = await Course.find({ teacherID: id });
  if (!courses) {
    throw new Error('Courses not found');
  }
  const enrollments = await Enrollment.find({
    teacherID: id,
  });
  const totalStudent = await Student.find();
  return {
    totalCourse: courses.length,
    totalCourseTaker: enrollments.length,
    totalStudent: totalStudent.length,
  };
};
export const totalService = { getOverallRating, getEarnings, getCourseStatus };
