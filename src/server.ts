import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';
import { Info } from './app/modules/info/info.model';
import { initCronJobs } from './app/modules/cron/cronService.controller';
//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

let server: any;
let exportIO: Server;
async function main() {
  try {
    mongoose.connect(config.database_url as string);
    logger.info(colors.green('🚀 Database connected successfully'));

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port:${config.port}`)
      );
    });
    initCronJobs();
    logger.info(colors.green('🕒 Cron jobs initialized'));
    //socket
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    exportIO = io;
    socketHelper.socket(io, app);
  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'));
  }

  //handle unhandleRejection
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandleRejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}
main();
// crerating a blank info by default if it doesn't exist
(async () => {
  const info = await Info.findOne({});
  if (!info) {
    const result = await Info.create({
      Name: 'INFO',
      About: ' ',
      PrivecyPolicy: ' ',
      TermsAndConditions: ' ',
    });
    if (!result) {
      throw new Error('Info not created');
    }
  }
})();

//SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE');
  if (server) {
    server.close();
  }
});
export { exportIO };
