const jwt = require('jsonwebtoken');

const setupSocketHandlers = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie
      ?.split(';')
      .find((c) => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Join bug room when viewing a bug
    socket.on('bug:join', (bugId) => {
      socket.join(`bug:${bugId}`);
      console.log(`User ${socket.userId} joined bug room: ${bugId}`);
    });

    socket.on('bug:leave', (bugId) => {
      socket.leave(`bug:${bugId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocketHandlers };
