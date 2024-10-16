import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { ITeacher, TeacherModel } from './teacher.interface';

const teacherSchema = new Schema<ITeacher, TeacherModel>(
  {
    firstName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: USER_ROLES.TEACHER,
      required: true,
    },
    appointedBy: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ['platform', 'freelancer'],
      default: 'freelancer',
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/, // Regex for basic email validation
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    profile: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
    },
    gender: {
      type: String,
      default: 'male',
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: {
      day: {
        type: Number,
        min: 1,
        max: 31,
      },
      month: {
        type: Number,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear(),
      },
    },

    designation: {
      type: String,
    },
    experience: {
      type: Number,
      min: 0,
    },

    accountInformation: {
      stripeAccountId: {
        type: String,
        default: null,
      },
      externalAccountId: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        default: 'active',
      },
    },
    education: [
      {
        degree: {
          type: String,
          required: true,
        },
        institute: {
          type: String,
          required: true,
        },
      },
    ],
    authentication: {
      isResetPassword: {
        type: Boolean,
        default: false,
      },
      oneTimeCode: {
        type: Number,
        default: null,
      },
      expireAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

//exist Teacher check
teacherSchema.statics.isExistTeacherById = async (id: string) => {
  const isExist = await Teacher.findById(id);
  return isExist;
};

teacherSchema.statics.isExistTeacherByEmail = async (email: string) => {
  const isExist = await Teacher.findOne({ email });
  return isExist;
};

//is match password
teacherSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check Teacher
teacherSchema.pre('save', async function (next) {
  //check Teacher
  const isExist = await Teacher.findOne({ email: this.email });
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

export const Teacher = model<ITeacher, TeacherModel>('Teacher', teacherSchema);
