require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');

const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
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

const PORT = process.env.PORT || 4000;

// Inicializar agentes automáticos (Lotus Domino Agents)
const { initAgents } = require('./agents/scheduler');
initAgents();

app.listen(PORT, () => {
  console.log(`🚀 Servidor Lotus Domino corriendo en puerto ${PORT}`);
  console.log(`📊 Sistema de Workflow Supervisor-Brigadista activo`);
  console.log(`🤖 Agentes automáticos inicializados`);
});
