import { StatusCodes } from 'http-status-codes';
import config from '../../../../config';
import { Course } from '../course.model';
import { Enrollment } from './enrollment.model';
import Stripe from 'stripe';
import ApiError from '../../../../errors/ApiError';
import { Teacher } from '../../teacher/teacher.model';

const stripe = new Stripe(config.stripe_secret_key!);

const createEnrollmentToDB = async (data: any) => {
  const isExistCourse = await Course.findOne({ _id: data.courseID });

  if (!isExistCourse) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found');
  }

  const teacher = await Teacher.findOne({ _id: isExistCourse.teacherID });
  let paymentIntent;

  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: isExistCourse.price * 100,
      currency: 'usd',
      payment_method: data.paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        courseID: data.courseID,
        studentID: data.studentID,
      },
    });
  } catch (error) {
    console.error(error);
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment failed');
  }

  const enrollmentData = {
    studentID: data.studentID,
    courseID: data.courseID,
    paymentIntentId: paymentIntent.id,
  };

  const result = await Enrollment.create(enrollmentData);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Enrollment not recorded');
  }

  const updatedCourse = await Course.findOneAndUpdate(
    { _id: data.courseID },
    { $push: { enrollmentsID: result._id } },
    { new: true }
  );

  if (!updatedCourse) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Enrollment update failed');
  }

  const teacherShare = isExistCourse.price * 0.8 * 100;

  try {
    // Check if teacher's account has 'transfers' capability
    const account = await stripe.accounts.retrieve(teacher?.stripeAccountId!);

    if (
      !account.capabilities?.transfers ||
      account.capabilities?.transfers !== 'active'
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Teacher's account does not have transfers capability enabled."
      );
    }

    // Proceed with the transfer
    await stripe.transfers.create({
      amount: teacherShare,
      currency: 'usd',
      destination: teacher?.stripeAccountId!,
      transfer_group: paymentIntent.id,
    });
  } catch (error) {
    console.error('Transfer failed:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to transfer funds to teacher'
    );
  }

  return result;
};

export const EnrollmentService = {
  createEnrollmentToDB,
};
