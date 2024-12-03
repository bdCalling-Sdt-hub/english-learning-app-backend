import { Server } from 'socket.io';
import { INFO } from '../../../enums/info';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { NotificationService } from '../notifications/notification.service';
import { IInfo } from './info.interface';
import { Info } from './info.model';

const updateInfoToDB = async (
  data: Partial<IInfo>,
  type: string,
  io: Server
) => {
  let result;
  let whatUpdated;
  if (type === INFO.ABOUT) {
    if (!data.About) throw new ApiError(400, 'About is required');
    data.About = await data.About?.toString();
    const update = await Info.findOneAndUpdate(
      { Name: 'INFO' },
      {
        $set: {
          About: data.About,
        },
      },
      {
        new: true,
      }
    );
    if (!update) {
      throw new ApiError(400, 'Could not update');
    }
    whatUpdated = null;
    result = update;
  } else if (type === INFO.PRIVACYPOLICY) {
    if (!data.PrivecyPolicy)
      throw new ApiError(400, 'PrivecyPolicy is required');

    data.PrivecyPolicy = await data.PrivecyPolicy?.toString();

    const update = await Info.findOneAndUpdate(
      { Name: 'INFO' },
      {
        $set: {
          PrivecyPolicy: data.PrivecyPolicy,
        },
      },
      {
        new: true,
      }
    );
    if (!update) {
      throw new ApiError(400, 'Could not update');
    }
    result = update;
    whatUpdated = 'Privecy and Policy';
  } else if (type === INFO.TERMSANDCONDITIONS) {
    if (!data.TermsAndConditions)
      throw new ApiError(400, 'TermsAndConditions is required');

    data.TermsAndConditions = await data.TermsAndConditions?.toString();

    const update = await Info.findOneAndUpdate(
      { Name: 'INFO' },
      {
        $set: {
          TermsAndConditions: data.TermsAndConditions,
        },
      },
      {
        new: true,
      }
    );
    if (!update) {
      throw new ApiError(400, 'Could not update');
    }
    result = update;
    whatUpdated = 'Terms and Conditions';
  } else {
    throw new ApiError(400, 'Invalid type');
  }
  const notificationMessage = `Admin updated the ${whatUpdated}`;
  if (whatUpdated !== null) {
    const sendToTeachers =
      await NotificationService.sendNotificationToAllUsersOfARole(
        USER_ROLES.TEACHER,
        {
          sendTo: USER_ROLES.TEACHER,
          title: 'Admin Updated',
          description: notificationMessage,
          data: { type: whatUpdated },
        },
        io
      );
    const sendToStudents =
      await NotificationService.sendNotificationToAllUsersOfARole(
        USER_ROLES.STUDENT,
        {
          sendTo: USER_ROLES.STUDENT,
          title: 'Admin Updated',
          description: notificationMessage,
          data: { type: whatUpdated },
        },
        io
      );

    if (!sendToStudents || !sendToTeachers) {
      throw new ApiError(400, 'Could not send notification');
    }
  }
  return result;
};

const getInfoFromDB = async (type: string) => {
  let result;
  const info = await Info.findOne({ Name: 'INFO' });
  if (!info) {
    throw new ApiError(400, 'Could not find INFO');
  }
  if (type === INFO.ABOUT) {
    result = info?.About;
  } else if (type === INFO.TERMSANDCONDITIONS) {
    result = info?.TermsAndConditions;
  } else if (type === INFO.PRIVACYPOLICY) {
    result = info?.PrivecyPolicy;
  } else {
    throw new ApiError(400, 'Invalid type');
  }
  return result;
};
const getAllInfosFromDB = async () => {
  const result = await Info.findOne({ Name: 'INFO' });
  return result;
};

export const InfoService = {
  updateInfoToDB,
  getAllInfosFromDB,
  getInfoFromDB,
};
