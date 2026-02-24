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

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/notes', require('./routes/note.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/calendar', require('./routes/calendar.routes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lotus Notes Collaboration API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      notes: '/api/notes',
      tasks: '/api/tasks',
      messages: '/api/messages',
      calendar: '/api/calendar'
    }
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Lotus Notes corriendo en puerto ${PORT}`);
});
