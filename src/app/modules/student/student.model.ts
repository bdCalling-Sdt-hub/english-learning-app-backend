import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IStudent, StudentModel } from './student.interface';
import { object } from 'zod';
import { LANGUAGE } from '../../../enums/language';

const userSchema = new Schema<IStudent, StudentModel>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: USER_ROLES.STUDENT,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    banner: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    address: {
      type: String,
      required: false,
    },
    profile: {
      type: String,
      default: '/profiles/default.png',
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },

    verified: {
      type: Boolean,
      default: false,
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    language: {
      type: String,
      enum: LANGUAGE,
      default: LANGUAGE.ENGLISH,
    },
    wishlist: {
      type: [String],
      default: [],
      required: false,
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: String,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
  },
  { timestamps: true }
);

//exist user check
userSchema.statics.isExistStudentById = async (id: string) => {
  const isExist = await Student.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await Student.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre('save', async function (next) {
  //check user
  const isExist = await Student.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const Student = model<IStudent, StudentModel>('Student', userSchema);
