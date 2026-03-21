require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Conectar a la base de datos
connectDB();

// CORS configurado desde variables de entorno
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej: Postman, curl) en desarrollo
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting general en toda la API
app.use('/api', apiLimiter);

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// Rutas — rate limiter estricto solo en auth
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/notes', require('./routes/note.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/calendar', require('./routes/calendar.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Nuevas rutas Lotus Domino (Supervisor-Brigadista)
app.use('/api/supervisor', require('./routes/supervisor.routes'));
app.use('/api/brigadista', require('./routes/brigadista.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/gallery', require('./routes/gallery.routes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lotus Notes Collaboration API - Sistema Lotus Domino',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      notes: '/api/notes',
      tasks: '/api/tasks',
      messages: '/api/messages',
      calendar: '/api/calendar',
      reports: '/api/reports',
      supervisor: '/api/supervisor',
      brigadista: '/api/brigadista',
      notifications: '/api/notifications'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  // Errores de validación de Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: err.errors?.[0]?.message || 'Error de validación',
      errors: err.errors?.map(e => e.message)
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }

  console.error(`[${new Date().toISOString()}] Error ${status}:`, err.message);
  if (isDev) console.error(err.stack);

  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(isDev && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 4000;

// Crear servidor HTTP para Socket.io
const http = require('http');
const server = http.createServer(app);

// Inicializar Socket.io
const { initializeSocket } = require('./config/socket');
initializeSocket(server);

// Inicializar agentes automáticos (Lotus Domino Agents)
const { initAgents } = require('./agents/scheduler');
initAgents();

server.listen(PORT, () => {
  console.log(`🚀 Servidor Lotus Domino corriendo en puerto ${PORT}`);
  console.log(`📊 Sistema de Workflow Supervisor-Brigadista activo`);
  console.log(`🤖 Agentes automáticos inicializados`);
  console.log(`🔌 Socket.io activo para notificaciones en tiempo real`);
});
