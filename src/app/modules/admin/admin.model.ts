import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { AdminModel, IAdmin } from './admin.interface';

const adminSchema = new Schema<IAdmin, AdminModel>(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
    },
    password: {
      type: String,
      required: [true, 'password is required'],
    },
    type: {
      type: String,
      enum: Object.values(AdminTypes),
      default: AdminTypes.ADMIN,
      required: [true, 'type is required'],
    },
    verified: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: USER_ROLES.ADMIN,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
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
  },
  { timestamps: true }
);
adminSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};
adminSchema.pre('save', async function (next) {
  const isExistSuperAdmin = await Admin.find({
    type: AdminTypes.SUPERADMIN,
  });
  if (isExistSuperAdmin.length > 1) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Super Admin already exist!');
  }
  if (this.type === AdminTypes.SUPERADMIN) {
    this.verified = true;
  }

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const Admin = model<IAdmin, AdminModel>('Admin', adminSchema);
