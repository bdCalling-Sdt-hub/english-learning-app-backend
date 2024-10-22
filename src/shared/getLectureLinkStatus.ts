import { Lecture } from '../app/modules/course/lecture/lecture.model';

enum LectureLinkStatus {
  DEPRECATED = 'DEPRECATED',
  NEEDTOUNLOCK = 'NEEDTOUNLOCK',
  LOCKED = 'LOCKED',
}

const getLectureLinkStatus = async (
  lectureId: string
): Promise<LectureLinkStatus> => {
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    throw new Error('Lecture not found');
  }

  const now = new Date();
  const lectureDate = new Date(lecture.date);

  // Set both dates to the start of their respective days for accurate comparison
  now.setHours(0, 0, 0, 0);
  lectureDate.setHours(0, 0, 0, 0);

  if (lectureDate < now) {
    return LectureLinkStatus.DEPRECATED;
  } else if (lectureDate.getTime() === now.getTime()) {
    return lecture.link
      ? LectureLinkStatus.DEPRECATED
      : LectureLinkStatus.NEEDTOUNLOCK;
  } else {
    return LectureLinkStatus.LOCKED;
  }
};

export default getLectureLinkStatus;
