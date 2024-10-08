import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { reviewsService } from './reviews.service';

const createReviews = catchAsync(async (req: Request, res: Response) => {
  const { ...reviewData } = req.body;
  const data = {
    ...reviewData,
  };
  const result = await reviewsService.createReviewsToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reviews created successfully',
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await reviewsService.getAllReviewsFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const getSingleReview = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await reviewsService.getSingleReviewFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Review retrieved successfully',
    data: result,
  });
});

const getStudentReviews = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await reviewsService.getStudentReviewsFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

export const ReviewsController = {
  createReviews,
  getAllReviews,
  getSingleReview,
  getStudentReviews,
};
