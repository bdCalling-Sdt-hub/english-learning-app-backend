import { Course } from '../app/modules/course/course.model';
import { Lecture } from '../app/modules/course/lecture/lecture.model';

export enum LectureLinkStatus {
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
  const isExistCourse = await Course.findById(lecture.courseID);
  if (!isExistCourse) {
    throw new Error('Course not found');
  }
  if (isExistCourse.status === 'completed') {
    return LectureLinkStatus.DEPRECATED;
  }
  const now = new Date();
  const lectureDate = new Date(lecture.date);

  // Set both dates to the start of their respective days for accurate comparison
  now.setHours(0, 0, 0, 0);
  lectureDate.setHours(0, 0, 0, 0);
  // @ts-ignore
  if (lecture.link !== null && lecture?.link?.length > 0)
    return LectureLinkStatus.DEPRECATED;
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
