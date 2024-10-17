// src/helpers/socketHelper.ts
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/logger';
import colors from 'colors';

const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string; // The _id from MongoDB
    const email = socket.handshake.query.email as string; // Alternatively, use email

    if (userId || email) {
      const roomIdentifier = userId || email;
      socket.join(roomIdentifier);
      logger.info(
        colors.blue(`User with ID/Email ${roomIdentifier} connected`)
      );
    }

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnected'));
    });
  });
};

export const socketHelper = { socket };
