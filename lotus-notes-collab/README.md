# Lotus Notes Collaboration System

Sistema de colaboración inspirado en Lotus Notes con funcionalidades de notas, documentos, tareas, calendario y mensajería.

## Características

- 📝 Gestión de Notas (públicas y privadas)
- 📋 Sistema de Tareas con asignación
- 📅 Calendario de Eventos
- 💬 Mensajería interna
- 👥 Gestión de Usuarios
- 🔐 Autenticación JWT

## Instalación

```bash
cd lotus-notes-collab
npm install
```

## Configuración

1. Copia `.env.example` a `.env`
2. Configura las variables de entorno
3. Crea la base de datos en MySQL:

```sql
CREATE DATABASE lotus_notes_db;
```

## Uso

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Endpoints API

### Autenticación
- POST `/api/auth/register` - Registrar usuario
- POST `/api/auth/login` - Iniciar sesión

### Notas
- POST `/api/notes` - Crear nota
- GET `/api/notes` - Listar mis notas
- GET `/api/notes/public` - Listar notas públicas
- PUT `/api/notes/:id` - Actualizar nota
- DELETE `/api/notes/:id` - Eliminar nota

### Tareas
- POST `/api/tasks` - Crear tarea
- GET `/api/tasks/my-tasks` - Mis tareas asignadas
- PUT `/api/tasks/:id` - Actualizar tarea
- DELETE `/api/tasks/:id` - Eliminar tarea

### Mensajes
- POST `/api/messages` - Enviar mensaje
- GET `/api/messages/inbox` - Bandeja de entrada
- GET `/api/messages/sent` - Mensajes enviados
- PUT `/api/messages/:id/read` - Marcar como leído

### Calendario
- POST `/api/calendar` - Crear evento
- GET `/api/calendar` - Listar eventos
- PUT `/api/calendar/:id` - Actualizar evento
- DELETE `/api/calendar/:id` - Eliminar evento

## Tecnologías

- Node.js + Express
- MySQL + Sequelize
- JWT Authentication
- bcryptjs
- CORS

## Puerto

El servidor corre en el puerto 4000 por defecto.
