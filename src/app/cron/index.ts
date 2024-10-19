import cron from 'node-cron';
import { logger } from '../../shared/logger';

export const initCronJobs = () => {
  //   cron.schedule('* * * * *', () => {
  cron.schedule('0 0 * * *', () => {
    logger.info('Running daily cron job');
  });
};
