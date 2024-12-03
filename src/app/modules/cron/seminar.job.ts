import { USER_ROLES } from '../../../enums/user';
import { NotificationService } from '../notifications/notification.service';
import { Seminar } from '../seminar/seminar.model';
import { seminarService } from '../seminar/seminar.service';
import { Student } from '../student/student.model';
import { socketHelper } from '../../../helpers/socketHelper';
import app from '../../../app';
import { checkIfTodayIs } from '../../../helpers/dateHelper';
import { Server } from 'socket.io';
import { exportIO } from '../../../server';

const seminerReminder = async () => {
  const seminars = await Seminar.find({
    bookings: { $exists: true, $ne: [] },
    status: 'published',
  }).populate('bookings');
  console.log(seminars);
  for (const seminar of seminars) {
    const isMatchDateTime = checkIfTodayIs(seminar.date, seminar.time);
    if (isMatchDateTime) {
      for (const id of seminar.bookings) {
        const send = await NotificationService.sendNotificationToDB(
          {
            sendTo: USER_ROLES.STUDENT,
            sendUserID: id.toString(),
            title: 'Seminar Reminder',
            description: `The seminar ${seminar.title} will be held today at ${seminar.time}`,
            data: { seminarID: seminar._id },
          },
          exportIO
        );
        if (send) {
          console.log('seminar reminder sent');
          continue;
        }
      }
      await NotificationService.sendNotificationToDB(
        {
          sendTo: USER_ROLES.TEACHER,
          sendUserID: seminar.teacher.toString(),
          title: 'Seminar Reminder',
          description: `Your seminar ${seminar.title} will be held today at ${seminar.time}`,
          data: { seminarID: seminar._id },
        },
        exportIO
      );
    }
  }
};

export const seminarJob = {
  seminerReminder,
};
