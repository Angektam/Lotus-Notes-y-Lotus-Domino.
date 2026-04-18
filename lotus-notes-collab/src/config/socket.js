// Configuración de Socket.io para notificaciones en tiempo real
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSockets = new Map(); // Map userId -> socketId

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Autenticar usuario via token JWT
    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        userSockets.set(userId, socket.id);
        socket.userId = userId;
        socket.emit('authenticated', { success: true });
        io.emit('userOnline', { userId });
        console.log(`✅ Socket autenticado: usuario ${userId}`);
      } catch (err) {
        socket.emit('authenticated', { success: false, error: 'Token inválido' });
        console.warn(`⚠️ Socket auth fallida: ${err.message}`);
      }
    });

    // Desconexión
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
        io.emit('userOffline', { userId: socket.userId });
        console.log(`❌ Usuario ${socket.userId} desconectado`);
      }
    });
  });

  return io;
};

// Enviar notificación a un usuario específico
const sendNotificationToUser = (userId, notification) => {
  const socketId = userSockets.get(userId);
  if (socketId && io) {
    io.to(socketId).emit('notification', notification);
    console.log(`📨 Notificación enviada a usuario ${userId}`);
  }
};

// Enviar actualización de reporte
const sendReportUpdate = (userId, report) => {
  const socketId = userSockets.get(userId);
  if (socketId && io) {
    io.to(socketId).emit('reportUpdate', report);
    console.log(`📊 Actualización de reporte enviada a usuario ${userId}`);
  }
};

// Broadcast a todos los usuarios conectados
const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`📢 Broadcast: ${event}`);
  }
};

module.exports = {
  initializeSocket,
  sendNotificationToUser,
  sendReportUpdate,
  broadcastToAll,
  getOnlineUsers: () => Array.from(userSockets.keys())
};
