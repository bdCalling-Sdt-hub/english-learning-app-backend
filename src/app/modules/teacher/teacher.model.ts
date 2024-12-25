import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { ITeacher, TeacherModel } from './teacher.interface';
import { LANGUAGE } from '../../../enums/language';

const teacherSchema = new Schema<ITeacher, TeacherModel>(
  {
    name: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    banner: {
      type: String,
      required: false,
      default: '/banners/default.png',
    },
    role: {
      type: String,
      default: USER_ROLES.TEACHER,
      required: false,
    },
    skills: {
      type: [String],
      required: false,
    },
    appointedBy: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ['platform', 'freelancer'],
      default: 'freelancer',
      required: false,
    },
    email: {
      type: String,
      required: false,
      sparse: true,
      unique: false,
      lowercase: true,
    },
    location: {
      type: String,
      required: false,
      default: '',
    },
    about: {
      type: String,
      required: false,
      default: '',
    },
    dateOfBirth: {
      type: String,
      required: false,
      default: '',
    },
    designation: {
      type: String,
      required: false,
      default: '',
    },
    experience: {
      type: String,
      required: false,
      default: '',
    },
    phone: {
      type: String,
      required: false,
    },

    earnings: {
      type: Number,
      default: 0,
    },
    pendingEarnings: {
      type: Number,
      default: 0,
    },
    profile: {
      type: String,
      default: '/profiles/default.png',
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
    appId: {
      type: String,
      required: false,
      unique: false,
    },
    loginType: {
      type: String,
      required: false,
      enum: ['apple', 'google'],
    },
    // language: {
    //   type: String,
    //   enum: LANGUAGE,
    //   default: LANGUAGE.ENGLISH,
    // },
    country: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      default: 'male',
      enum: ['male', 'female', 'other'],
    },

    accountInformation: {
      bankAccountNumber: {
        type: String,
        default: null,
        required: false,
      },
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
    degree: {
      type: String,
    },
    institute: {
      type: String,
    },
    educationFiles: {
      type: [String],
      required: false,
    },
    // education: [
    //   {
    //     id: {
    //       type: String,
    //       default: null,
    //     },
    //     degree: {
    //       type: String,
    //       required: true,
    //     },
    //     institute: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // ],
    authentication: {
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
    password: {
      type: String,
      required: false,
      select: 0,
      minlength: 8,
    },
  },
  { timestamps: true }
);

//exist Teacher check
teacherSchema.statics.isExistTeacherById = async (id: string) => {
  const isExist = await Teacher.findById(id);
  return isExist;
};
teacherSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
  }
);
//is match password
teacherSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check Teacher
teacherSchema.pre('save', async function (next) {
  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const Teacher = model<ITeacher, TeacherModel>('Teacher', teacherSchema);
