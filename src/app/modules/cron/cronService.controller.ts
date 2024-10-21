import cron from 'node-cron';
import { logger } from '../../../shared/logger';
import config from '../../../config';
import { seminarJob } from './seminar.job';

export const initCronJobs = () => {
  cron.schedule('* * * * *', () => {
    seminarJob.seminerReminder();
    logger.info('Running daily cron job');
  });
};