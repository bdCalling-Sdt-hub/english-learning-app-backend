import { Teacher } from '../../teacher/teacher.model';
import { Course } from '../course.model';

const filterCourseByGenderFromDB = async (gender: string) => {
  const result = Course.find({ gender: gender, status: { $ne: 'delete' } });
  if (!result) {
    throw new Error('Course not found!');
  }
  return result;
};
const filterCourseByDateFromDB = async (date: string) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  const dateString = '2024-10-01T09:00:00Z';
  const dateFormat = 'YYYY-MM-DDTHH:mm:ssZ';
  if (!dateRegex.test(date)) {
    console.log(
      `Invalid date format date should be in this ${dateFormat} for example ${dateString}`
    );
  }
  const result = await Course.find({
    //@ts-ignore
    'time.start': date,
    status: { $ne: 'delete' },
  });
  if (!result) {
    throw new Error('Course not found!');
  }
  return result;
};

const filterCourseByRateFromDB = async (from: number, to: number) => {
  if (from > to) {
    throw new Error('Invalid range: from should be less than to');
  }
  if (to <= 0) {
    throw new Error('Invalid range: to should be greater than 0');
  }

  try {
    const result = await Course.find({
      price: { $gte: from, $lte: to },
      status: { $ne: 'delete' },
    });
    if (!result || result.length === 0) {
      throw new Error('Course not found!');
    }
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const filterService = {
  filterCourseByGenderFromDB,
  filterCourseByDateFromDB,
  filterCourseByRateFromDB,
};
