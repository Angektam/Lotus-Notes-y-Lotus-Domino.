// Configuración de Socket.io para notificaciones en tiempo real
const socketIO = require('socket.io');

let io;
const userSockets = new Map(); // Map userId -> socketId

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    // Autenticar usuario
    socket.on('authenticate', (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      console.log(`✅ Usuario ${userId} autenticado con socket ${socket.id}`);
    });

    // Desconexión
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
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
  broadcastToAll
};
