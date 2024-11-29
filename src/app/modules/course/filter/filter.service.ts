import { Student } from '../../student/student.model';
import { Teacher } from '../../teacher/teacher.model';
import { Course } from '../course.model';
import { Lecture } from '../lecture/lecture.model';
import { CourseFilterParams } from './filter.interface';

const filterCourseByGenderFromDB = async (gender: string) => {
  const result = Course.find({ gender: gender, status: { $ne: 'delete' } });
  if (!result) {
    throw new Error('Course not found!');
  }
  return result;
};
const filterCourseByDateFromDB = async (date: string) => {
  // Validate date format using a regex
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

  // Check if the date matches the expected format
  if (!dateRegex.test(date)) {
    const dateFormat = 'DD-MM-YYYY';
    const dateExample = '11-12-2024';

    throw new Error(
      `Invalid date format. Date should be in this format: ${dateFormat}. Example: ${dateExample}`
    );
  }

  // Optional: Additional date validation
  const [day, month, year] = date.split('-').map(Number);
  const isValidDate = () => {
    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  if (!isValidDate()) {
    throw new Error('Invalid date. Please provide a valid date.');
  }

  try {
    const result = await Course.find({
      startDate: date, // Exact match on the startDate string
      status: { $ne: 'delete' },
    });

    if (result.length === 0) {
      throw new Error(`No courses found for the date: ${date}`);
    }

    return result;
  } catch (error) {
    console.error('Error filtering courses:', error);
    throw error;
  }
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

const filterCourseBySearchFromDB = async (search: any) => {
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

const getTeacherCourses = async (id: any, queryParams: any) => {
  const courses = await Course.find({
    teacherID: id,
    status: 'active',
  });
  if (!courses) {
    throw new Error('Course not found!');
  }
  return courses;
};
const getMyCoursesFromDB = async (id: any, queryParams: any) => {
  const courses = await Course.find({
    teacherID: id,
    ...queryParams,
  });
  const finalResult = await Promise.all(
    courses.map(async (course: any) => {
      const teacher = await Teacher.findOne({ _id: course.teacherID });
      const courseObj = course.toObject();
      const totalLectures = await Lecture.countDocuments({
        courseID: course._id,
      });
      return {
        ...courseObj,

        teacherName: teacher?.name,
        totalLectures,
      };
    })
  );
  return finalResult;
};
const getCourseByTypeFromDB = async (type: string, studentId: string = '') => {
  try {
    // Find courses by type and active status
    const courses = await Course.find({
      type: type as string,
      status: 'active',
    });

    // Throw error if no courses found
    if (courses.length === 0) {
      throw new Error('Course not found!');
    }

    // Find student only if studentId is provided
    const student = studentId
      ? await Student.findOne({ _id: studentId }).select('wishlist')
      : null;

    // Map courses with additional details
    const finalResult = await Promise.all(
      courses.map(async (course: any) => {
        // Find teacher for the course
        const teacher = await Teacher.findOne({ _id: course.teacherID });

        // Convert mongoose document to plain object
        const courseObj = course.toObject();

        // Check if course is in student's wishlist
        const isWishlisted = student
          ? //@ts-ignore
            student.wishlist.includes(course._id)
          : false;

        return {
          ...courseObj,
          startDate: courseObj.startDate,
          isFavourite: isWishlisted,
          teacherName: teacher?.name,
          totalLectures: course?.lectures?.length,
        };
      })
    );

    return finalResult;
  } catch (error) {
    console.error('Error in getCourseByTypeFromDB:', error);
    throw error;
  }
};

const unifiedCourseFilter = async (queryParams: CourseFilterParams) => {
  try {
    // Base query to exclude deleted courses
    const query: any = { status: { $ne: 'delete' } };

    // Search filter
    if (queryParams.search) {
      const regexSearch = new RegExp(queryParams.search, 'i');
      query.$or = [
        { name: { $regex: regexSearch } },
        { details: { $regex: regexSearch } },
      ];
    }

    // Date filter
    if (queryParams.date) {
      // Validate date format
      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dateRegex.test(queryParams.date)) {
        queryParams.date = queryParams.date.split(' ')[0];
      }

      // Additional date validation
      const [day, month, year] = queryParams.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      if (
        dateObj.getFullYear() !== year ||
        dateObj.getMonth() !== month - 1 ||
        dateObj.getDate() !== day
      ) {
        throw new Error('Invalid date');
      }

      query.startDate = queryParams.date;
    }

    // Gender filter
    if (queryParams.gender) {
      query.gender = queryParams.gender;
    }

    // Price range filter

    if (
      queryParams.priceFrom &&
      queryParams.priceTo &&
      queryParams.priceFrom <= queryParams.priceTo &&
      queryParams.priceTo > 0 &&
      queryParams.priceFrom > 0
    ) {
      query.price = {
        $gte: queryParams.priceFrom,
        $lte: queryParams.priceTo,
      };
    }

    // Type filter
    if (queryParams.type) {
      query.type = queryParams.type;
    }
    // language filter
    if (queryParams.language) {
      query.language = queryParams.language.toUpperCase() as string;
    }
    // Perform the base query
    const courses = await Course.find(query);

    // If no courses found
    if (courses.length === 0) {
      return [];
    }

    // If student ID is provided, enrich with wishlist and teacher info
    if (queryParams.studentId) {
      const finalResult = await Promise.all(
        courses.map(async (course: any) => {
          // Find student and teacher
          const [student, teacher] = await Promise.all([
            Student.findOne({ _id: queryParams.studentId }).select('wishlist'),
            Teacher.findOne({ _id: course.teacherID }),
          ]);

          // Convert to plain object
          const courseObj = course.toObject();

          // Check if course is in student's wishlist
          const isWishlisted = student
            ? //@ts-ignore
              student.wishlist.includes(course._id)
            : false;

          return {
            ...courseObj,
            isFavourite: isWishlisted,
            teacherName: teacher?.name,
            totalLectures: course?.lectures?.length,
          };
        })
      );

      // Custom sorting for search results if search is provided
      return queryParams.search
        ? sortSearchResults(finalResult, queryParams.search)
        : finalResult;
    }
    let finalResult = await Promise.all(
      courses.map(async (course: any) => {
        const teacher = await Teacher.findOne({ _id: course.teacherID });
        const courseObj = course.toObject();

        return {
          ...courseObj,
          startDate: courseObj.startDate,
          teacherName: teacher?.name,
          totalLectures: course?.lectures?.length,
        };
      })
    );
    return finalResult;
  } catch (error) {
    console.error('Error in unified course filter:', error);
    throw error;
  }
};

// Helper function for sorting search results
const sortSearchResults = (courses: any[], search: string) => {
  return courses.sort((a, b) => {
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

    return 0;
  });
};

export const filterService = {
  filterCourseByGenderFromDB,
  getTeacherCourses,
  getMyCoursesFromDB,
  getCourseByTypeFromDB,
  filterCourseByDateFromDB,
  filterCourseByRateFromDB,
  unifiedCourseFilter,
  filterCourseBySearchFromDB,
};
