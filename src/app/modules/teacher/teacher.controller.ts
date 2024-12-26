import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TeacherService } from './teacher.service';
import ApiError from '../../../errors/ApiError';
import { logger } from '../../../shared/logger';
import config from '../../../config';
import Stripe from 'stripe';
import { Teacher } from './teacher.model';
import fs from 'fs';
import path from 'path';
import { createLogger } from 'winston';
import { Server } from 'socket.io';

const stripeSecretKey = config.stripe_secret_key;

if (!stripeSecretKey) {
  throw new Error('Stripe secret key is not defined.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-09-30.acacia',
});

const createTeacher = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TeacherService.createTeacherToDB(req);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        'Teacher Registered successfully please check your email for OTP',
      data: '',
    });
  }
);

const getTeacherProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await TeacherService.getTeacherProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile

const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user;
    console.log(req.user);
    let profile;
    if (req.files && 'profile' in req.files && req.files.profile[0]) {
      profile = `/profiles/${req.files.profile[0].filename}`;
    }
    let educationFiles = [];
    if (
      req.files &&
      'educationFiles' in req.files &&
      req.files.educationFiles
    ) {
      for (const file of req.files.educationFiles) {
        educationFiles.push(`/educationFiles/${file.filename}`);
      }
    }
    const data = {
      profile,
      educationFiles,
      ...req.body,
    };
    const io: Server = req.app.get('io');
    const result = await TeacherService.updateProfileToDB(id, data, io);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const getAllTeachers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await TeacherService.getAllTeachersFromDB(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Teachers retrieved successfully',
    pagination: {
      currentPage: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
      total: result.length,
    },
    data: result,
  });
});

const getTeacherById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TeacherService.getTeacherByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Teacher retrieved successfully',
    data: result,
  });
});

const deleteTeacher = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await TeacherService.deleteTeacherFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Teacher deleted successfully',
    data: result,
  });
});

const setUpTeacherPayment = catchAsync(async (req: Request, res: Response) => {
  const data = req.body.data;
  let paths: any[] = [];

  // const paths: any[] = [];
  const ip = req.ip || '0.0.0.0';
  if (req.files && 'KYC' in req.files && req.files.KYC) {
    for (const file of req.files.KYC) {
      paths.push(`/KYCs/${file.filename}`);
    }
  }
  console.log(data);
  const user = req.user;
  if (!req.user.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const result = await TeacherService.createTeacherStripeAccount(
    data,
    req.files,
    user,
    paths,
    ip
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Connected account created successfully',
    data: result,
  });
});

const getTeachersByLanguage = catchAsync(
  async (req: Request, res: Response) => {
    const { language } = req.params;
    const result = await TeacherService.getTeachersByLanguageFromDB(language);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Teachers retrieved successfully',
      data: result,
    });
  }
);

export const TeacherController = {
  createTeacher,
  getTeacherProfile,
  updateProfile,
  getTeacherById,
  getAllTeachers,
  getTeachersByLanguage,
  deleteTeacher,
  setUpTeacherPayment,
};
