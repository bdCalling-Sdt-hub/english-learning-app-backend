import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CourseService } from './course.service';
import { logger } from '../../../shared/logger';
import { CourseValidation } from './course.validation';

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const { ...courseData } = req.body;
  let banner;
  if (req.files && 'banner' in req.files && req.files.banner[0]) {
    banner = `/banners/${req.files.banner[0].filename}`;
  }
  const data = {
    banner,
    ...courseData,
  };

  const result = await CourseService.createCourseToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course created successfully',
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { ...courseData } = req.body;
  delete courseData.banner;
  let banner;
  if (req.files && 'banner' in req.files && req.files.banner[0]) {
    banner = `/banners/${req.files.banner[0].filename}`;
  }
  const data = {
    banner,
    ...courseData,
  };
  const result = await CourseService.updateCourseToDB(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course updated successfully',
    data: result,
  });
});

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getAllCoursesFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Courses retrieved successfully',
    data: result,
  });
});

const getCourseById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await CourseService.getCourseByIdFromDB(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Course retrieved successfully',
      data: result,
    });
  }
);

const getCourseByTeacherId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.teacherID;
    const result = await CourseService.getCourseByTeacherIdFromDB(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Course retrieved successfully',
      data: result,
    });
  }
);

const getLecturesOfCourseByID = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await CourseService.getLecturesOfCourseFromDB(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Lecture retrieved successfully',
      data: result,
    });
  }
);

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await CourseService.deleteCourseFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Course deleted successfully',
    data: result,
  });
});

export const CourseController = {
  deleteCourse,
  createCourse,
  updateCourse,
  getCourseById,
  getCourseByTeacherId,
  getAllCourses,
  getLecturesOfCourseByID,
};
