import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { FaqService } from './faq.service';

const createFaq = catchAsync(async (req: Request, res: Response) => {
  const { ...faqData } = req.body;
  const data = {
    ...faqData,
  };
  const result = await FaqService.createFaqToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Faq created successfully',
    data: result,
  });
});

const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { ...faqData } = req.body;
  const data = {
    ...faqData,
  };
  const result = await FaqService.editFaqToDB(id, data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Faq updated successfully',
    data: result,
  });
});

const getFaqById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await FaqService.getFaqByIdFromDB(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Faq retrieved successfully',
      data: result,
    });
  }
);
const getAllFaqs = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.getAllFaqsFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Faqs retrieved successfully',
    data: result,
  });
});
const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await FaqService.deleteFaqFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Faq deleted successfully',
    data: result,
  });
});
export const FaqController = {
  createFaq,
  updateFaq,
  getFaqById,
  getAllFaqs,
  deleteFaq,
};
