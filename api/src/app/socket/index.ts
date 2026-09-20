import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from '../config';
import logger from '../utils/logger';

let io: SocketIOServer | null = null;

export const initializeSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.socket_cors_origin,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket not initialized');
  }
  return io;
};