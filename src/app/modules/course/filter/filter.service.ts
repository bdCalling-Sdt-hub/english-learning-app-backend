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

const filterCourseBySearchFromDB = async (search: string) => {
  if (!search) {
    throw new Error('Please provide search in the URL');
  }

  const regexSearch = new RegExp(search, 'i'); // Case-insensitive regex for search

  // Query to find any courses that match in `name` or `details`
  const courses = await Course.find({
    $or: [
      { name: { $regex: regexSearch } }, // Match in name
      { details: { $regex: regexSearch } }, // Match in details
    ],
  }).exec();

  if (!courses || courses.length === 0) {
    throw new Error('Course not found!');
  }

  // Sorting logic:
  const sortedCourses = courses.sort((a, b) => {
    const searchLower = search.toLowerCase();

    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aDetails = a.details.toLowerCase();
    const bDetails = b.details.toLowerCase();

    // 1. Exact match in `name` comes first
    if (aName === searchLower) return -1;
    if (bName === searchLower) return 1;

    // 2. Partial match in `name` comes next
    if (aName.startsWith(searchLower) && !bName.startsWith(searchLower))
      return -1;
    if (bName.startsWith(searchLower) && !aName.startsWith(searchLower))
      return 1;

    // 3. `name` contains the search term but is not a match at the start
    if (aName.includes(searchLower) && !bName.includes(searchLower)) return -1;
    if (bName.includes(searchLower) && !aName.includes(searchLower)) return 1;

    // 4. Match in `details` comes last
    if (aDetails.includes(searchLower) && !bDetails.includes(searchLower))
      return -1;
    if (bDetails.includes(searchLower) && !aDetails.includes(searchLower))
      return 1;

    return 0; // Otherwise, keep the same order
  });

  return sortedCourses;
};

export const filterService = {
  filterCourseByGenderFromDB,
  filterCourseByDateFromDB,
  filterCourseByRateFromDB,
  filterCourseBySearchFromDB,
};
