const { Server } = require('socket.io');
const { getRedisSubscriber } = require('./config/redis');

let ioInstance = null;

const initSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance = io;

  // Setup Redis Pub/Sub listener
  const subscriber = getRedisSubscriber();

  subscriber.psubscribe('interview:*', (err, count) => {
    if (err) {
      console.warn('[Socket.io] Redis psubscribe error:', err.message);
    } else {
      console.log(`[Socket.io] Subscribed to pattern 'interview:*' (Total patterns: ${count})`);
    }
  });

  subscriber.on('pmessage', (pattern, channel, message) => {
    try {
      // Channel is interview:<sessionId>
      const parts = channel.split(':');
      if (parts.length >= 2) {
        const sessionId = parts.slice(1).join(':');
        let payload;
        try {
          payload = JSON.parse(message);
        } catch {
          payload = { text: message };
        }

        // Broadcast to session rooms
        io.to(sessionId).emit('interview_stream', payload);
        io.to(`interview:${sessionId}`).emit('interview_stream', payload);

        // Also emit granular events for convenience
        if (payload.type === 'token' || payload.token) {
          io.to(sessionId).emit('token', payload);
        } else if (payload.type === 'start') {
          io.to(sessionId).emit('question_start', payload);
        } else if (payload.type === 'done' || payload.isComplete) {
          io.to(sessionId).emit('question_complete', payload);
        }
      }
    } catch (err) {
      console.warn('[Socket.io] Error broadcasting Redis message:', err.message);
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for specific session
    socket.on('join_session', (data) => {
      const sessionId = typeof data === 'string' ? data : data?.sessionId;
      if (sessionId) {
        socket.join(sessionId);
        socket.join(`interview:${sessionId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined room for session: ${sessionId}`);
        socket.emit('joined_room', {
          success: true,
          sessionId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('leave_session', (data) => {
      const sessionId = typeof data === 'string' ? data : data?.sessionId;
      if (sessionId) {
        socket.leave(sessionId);
        socket.leave(`interview:${sessionId}`);
        console.log(`[Socket.io] Socket ${socket.id} left room: ${sessionId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return ioInstance;
};

module.exports = {
  initSocketIO,
  getIO,
};
