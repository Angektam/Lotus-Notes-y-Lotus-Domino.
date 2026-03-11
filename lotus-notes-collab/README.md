# 📋 Sistema de Gestión de Servicio Social - Lotus Notes Style

Sistema completo de gestión de informes de servicio social con arquitectura inspirada en Lotus Notes/Domino, ahora con base de datos SQLite local.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
cd lotus-notes-collab
npm install
```

### 2. Inicializar Base de Datos

```bash
npm run init
```

Esto creará automáticamente:
- ✅ Base de datos SQLite (`database.sqlite`)
- ✅ Todas las tablas necesarias
- ✅ Usuarios de prueba
- ✅ Datos de ejemplo

### 3. Iniciar Servidor

```bash
npm start
# o para desarrollo
npm run dev
```

El servidor estará disponible en: `http://localhost:4000`

## 👥 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | Administrador |
| supervisor | admin123 | Supervisor |
| brigadista | admin123 | Brigadista |
| estudiante | admin123 | Estudiante |

## 🎯 Características

### Sistema de Reportes
- ✅ Creación y gestión de informes mensuales
- ✅ Workflow de aprobación (Asignado → En Elaboración → Enviado → Revisión → Aprobado)
- ✅ Versionado de documentos
- ✅ Historial de cambios (Audit Trail)
- ✅ Adjuntos y evidencias

### Roles y Permisos
- **Administrador**: Control total del sistema
- **Supervisor**: Asigna y revisa reportes de brigadistas
- **Brigadista**: Elabora reportes asignados
- **Estudiante**: Crea y gestiona sus informes de servicio social

### Módulos Adicionales
- 📝 Notas personales y compartidas
- ✅ Sistema de tareas con prioridades
- 📅 Calendario de eventos
- 💬 Mensajería interna
- 🔔 Notificaciones en tiempo real (Socket.io)
- 📊 Dashboard con estadísticas
- 📈 Reportes y analíticas

### Agentes Automáticos
- ⏰ Recordatorios de reportes pendientes
- 📅 Notificaciones de vencimiento
- 🔄 Procesamiento automático de tareas

## 🗄️ Base de Datos

### SQLite (Local)
- **Archivo**: `database.sqlite`
- **Ventajas**: 
  - Sin instalación de servidor
  - Portabilidad total
  - Cero configuración
  - Perfecto para despliegue

### Comandos Útiles

```bash
# Reiniciar base de datos (borra todos los datos)
npm run init

# Backup
copy database.sqlite database.backup.sqlite

# Ver datos (requiere sqlite3 CLI)
sqlite3 database.sqlite
.tables
SELECT * FROM users;
.quit
```

## 📁 Estructura del Proyecto

```
lotus-notes-collab/
├── database.sqlite          # Base de datos SQLite
├── init-sqlite.js          # Script de inicialización
├── src/
│   ├── config/
│   │   ├── database.js     # Configuración SQLite
│   │   └── socket.js       # Configuración Socket.io
│   ├── models/             # Modelos Sequelize
│   ├── controllers/        # Lógica de negocio
│   ├── routes/            # Rutas API
│   ├── middleware/        # Autenticación y validación
│   ├── agents/            # Agentes automáticos
│   └── server.js          # Punto de entrada
├── uploads/               # Archivos subidos
└── package.json
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Reportes
- `GET /api/reports` - Listar reportes
- `POST /api/reports` - Crear reporte
- `PUT /api/reports/:id` - Actualizar reporte
- `DELETE /api/reports/:id` - Eliminar reporte

### Admin
- `GET /api/admin/statistics` - Estadísticas generales
- `GET /api/admin/reports` - Todos los reportes
- `PUT /api/admin/reports/:id/approve` - Aprobar reporte
- `PUT /api/admin/reports/:id/reject` - Rechazar reporte

### Supervisor
- `GET /api/supervisor/brigadistas` - Listar brigadistas
- `POST /api/supervisor/assign` - Asignar reporte
- `GET /api/supervisor/pending` - Reportes pendientes

### Brigadista
- `GET /api/brigadista/reports` - Mis reportes asignados
- `PUT /api/brigadista/reports/:id/submit` - Enviar reporte

### Otros Módulos
- Notes: `/api/notes`
- Tasks: `/api/tasks`
- Calendar: `/api/calendar`
- Messages: `/api/messages`
- Notifications: `/api/notifications`

## 🔔 WebSocket Events

```javascript
// Cliente se conecta
socket.emit('authenticate', userId);

// Recibir notificación
socket.on('notification', (data) => {
  console.log('Nueva notificación:', data);
});

// Actualización de reporte
socket.on('reportUpdate', (report) => {
  console.log('Reporte actualizado:', report);
});
```

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de Datos**: SQLite + Sequelize ORM
- **Autenticación**: JWT
- **WebSockets**: Socket.io
- **Validación**: Express Validator
- **Archivos**: Multer
- **Cron Jobs**: Node-cron
- **Email**: Nodemailer (opcional)

## 📦 Despliegue

### Requisitos Mínimos
- Node.js 14+
- 512 MB RAM
- 1 GB espacio en disco

### Plataformas Compatibles
- ✅ Heroku
- ✅ Railway
- ✅ Render
- ✅ DigitalOcean
- ✅ AWS EC2
- ✅ VPS tradicionales

### Pasos para Despliegue

1. **Clonar repositorio**
```bash
git clone <tu-repo>
cd lotus-notes-collab
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

4. **Inicializar base de datos**
```bash
npm run init
```

5. **Iniciar servidor**
```bash
npm start
```

### Variables de Entorno

```env
PORT=4000
NODE_ENV=production
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://tu-frontend.com
```

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Contraseñas hasheadas (bcrypt)
- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ Rate limiting (recomendado agregar)
- ✅ Sanitización de datos

## 📊 Monitoreo

### Logs
Los logs se guardan en la consola. Para producción, considera:
- Winston
- Morgan
- PM2 logs

### Métricas
- Usuarios activos
- Reportes por estado
- Tiempo de respuesta
- Errores

## 🆘 Solución de Problemas

### Error: "Cannot find module 'sqlite3'"
```bash
npm install sqlite3
```

### Error: "database is locked"
- Cierra otras conexiones
- Reinicia el servidor

### Datos perdidos
```bash
# Restaurar desde backup
copy database.backup.sqlite database.sqlite

# O reiniciar (perderás datos)
npm run init
```

## 📚 Documentación Adicional

- [MIGRACION_SQLITE.md](../MIGRACION_SQLITE.md) - Detalles de la migración
- [VALIDACIONES_AGREGADAS.md](../VALIDACIONES_AGREGADAS.md) - Validaciones implementadas
- [GUIA_RAPIDA.md](./GUIA_RAPIDA.md) - Guía de uso rápido

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📝 Licencia

ISC

## 👨‍💻 Autor

Sistema desarrollado para gestión de servicio social universitario.

---

**Versión**: 3.1.0  
**Última actualización**: Marzo 2026  
**Estado**: ✅ Producción Ready
