import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { StudentRoutes } from '../app/modules/student/student.route';
import { TeacherRoutes } from '../app/modules/teacher/teacher.route';
import { CourseRoutes } from '../app/modules/course/course.route';
import { ReviewsRoutes } from '../app/modules/reviews/reviews.route';
import { AdminRoutes } from '../app/modules/admin/admin.routes';
import { SeminarRoutes } from '../app/modules/seminar/seminar.route';
import { ComplainRoutes } from '../app/modules/complain/complain.route';
import { FaqRoutes } from '../app/modules/faq/faq.routes';
import { InfoRoutes } from '../app/modules/info/info.routes';
import { BannerRoutes } from '../app/modules/banner/banner.routes';
import { NotificationRoutes } from '../app/modules/notifications/notification.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/students',
    route: StudentRoutes,
  },
  {
    path: '/courses',
    route: CourseRoutes,
  },
  {
    path: '/reviews',
    route: ReviewsRoutes,
  },
  {
    path: '/teachers',
    route: TeacherRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/seminars',
    route: SeminarRoutes,
  },
  {
    path: '/complains',
    route: ComplainRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/faq',
    route: FaqRoutes,
  },
  {
    path: '/info',
    route: InfoRoutes,
  },
  {
    path: '/banners',
    route: BannerRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
