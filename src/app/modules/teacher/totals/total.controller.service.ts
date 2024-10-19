import { Course } from '../../course/course.model';
import { Reviews } from '../../reviews/reviews.model';
import { Teacher } from '../teacher.model';

const getOverallRating = async (id: string) => {
  const isExistTeacher = await Teacher.isExistTeacherById(id);

  if (!isExistTeacher) {
    throw new Error("Teacher doesn't exist");
  }
  const courses = await Course.find({
    teacherID: id,
  });
  if (!courses) {
    throw new Error('Course not found');
  }
  const reviews = await Reviews.find({
    courseID: { $in: courses.map(course => course._id) },
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
  courses.forEach(course => {
    totalEnrollments = totalEnrollments + course.enrollmentsID.length;
  });
  return {
    avarageRating: avarageRating,
    totalRarings: reviews.length,
    totalCourseTaker: totalEnrollments,
  };
};

export const totalService = { getOverallRating };
