import catchAsync from '../../../../shared/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { filterService } from './filter.service';
import { jwtHelper } from '../../../../helpers/jwtHelper';
import config from '../../../../config';

const filterCourseByGender = catchAsync(async (req: Request, res: Response) => {
  const gender = req.params.gender;
  if (gender !== 'male' && gender !== 'female' && gender !== 'other') {
    throw new Error('Gender can only be either male, female or other');
  }

  const result = await filterService.filterCourseByGenderFromDB(
    gender.toString()
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});

const filterCourseByDate = catchAsync(async (req: Request, res: Response) => {
  const date = req.params.date;
  const result = await filterService.filterCourseByDateFromDB(date);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});

const filterCourseByRate = catchAsync(async (req: Request, res: Response) => {
  const { from, to } = req.query;
  if (!from || !to) {
    throw new Error('Please provide from and to in the URL');
  }
  const result = await filterService.filterCourseByRateFromDB(
    Number(from),
    Number(to)
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});
const filterCourseBySearch = catchAsync(async (req: Request, res: Response) => {
  const search = req.query.search || '';

  const result = await filterService.filterCourseBySearchFromDB(search);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});

const getTeacherCourses = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const filter = req.query;
  const result = await filterService.getTeacherCourses(id, filter);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});
const getMyCourses = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const filter = req.query;
  const result = await filterService.getMyCoursesFromDB(id, filter);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});
const getFreelancerCourses = catchAsync(async (req: Request, res: Response) => {
  // Extract bearer token from Authorization header
  const authorization = req.headers.authorization;
  const bearerToken = authorization?.split(' ')[1];

  let studentId = '';

  // Verify token and get user (if token exists)
  if (bearerToken) {
    try {
      const user = await jwtHelper.verifyToken(
        bearerToken,
        config.jwt.jwt_secret as string
      );

      // Safely extract studentId
      studentId = user?.id || '';
    } catch (error) {
      // Token verification failed
      console.error('Token verification error:', error);
      studentId = '';
    }
  }

  // Fetch freelancer courses
  const result = await filterService.getCourseByTypeFromDB(
    'freelancer',
    studentId
  );

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});
const getPlatformCourses = catchAsync(async (req: Request, res: Response) => {
  // Extract bearer token from Authorization header
  const authorization = req.headers.authorization;
  const bearerToken = authorization?.split(' ')[1];

  let studentId = '';

  // Verify token and get user (if token exists)
  if (bearerToken) {
    try {
      const user = await jwtHelper.verifyToken(
        bearerToken,
        config.jwt.jwt_secret as string
      );

      // Safely extract studentId
      studentId = user?.id || '';
    } catch (error) {
      // Token verification failed
      console.error('Token verification error:', error);
      studentId = '';
    }
  }

  // Fetch freelancer courses
  const result = await filterService.getCourseByTypeFromDB(
    'platform',
    studentId
  );

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});
const filterCourse = catchAsync(async (req: Request, res: Response) => {
  const filter = req.query;
  const result = await filterService.unifiedCourseFilter(filter);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});
export const filterController = {
  filterCourseByGender,
  filterCourseByRate,
  getTeacherCourses,
  getFreelancerCourses,
  getPlatformCourses,
  filterCourseBySearch,
  filterCourse,
  getMyCourses,
  filterCourseByDate,
};
