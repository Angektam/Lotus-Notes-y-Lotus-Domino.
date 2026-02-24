# Lotus Notes - Sistema de Colaboración Empresarial

Sistema de colaboración empresarial completo inspirado en Lotus Notes, que combina correo electrónico, calendario y plataforma para aplicaciones de negocio personalizadas.

## 📋 Descripción

Lotus Notes es una plataforma integral que permite a los empleados gestionar su comunicación, tareas y colaboración en un solo lugar. Incluye:

- **Correo Electrónico Interno**: Sistema de mensajería entre usuarios
- **Calendario**: Gestión de eventos, reuniones y recordatorios
- **Notas**: Documentación personal y compartida
- **Tareas**: Asignación y seguimiento de actividades
- **Aplicaciones de Negocio**: Plataforma extensible para módulos personalizados

## 🚀 Características

- ✅ Autenticación segura con JWT
- ✅ Gestión de usuarios con roles
- ✅ Sistema de mensajería interna
- ✅ Calendario de eventos
- ✅ Gestión de notas públicas y privadas
- ✅ Sistema de tareas con asignación
- ✅ Interfaz profesional y responsive
- ✅ API REST completa

## 🛠️ Tecnologías

### Backend
- Node.js + Express.js
- MySQL + Sequelize ORM
- JWT Authentication
- Bcrypt para encriptación

### Frontend
- React 18
- Vite
- React Router
- Axios

## 📦 Estructura del Proyecto

```
Lotus-Notes/
├── lotus-notes-collab/          # Backend API
│   ├── src/
│   │   ├── config/              # Configuración
│   │   ├── models/              # Modelos de datos
│   │   ├── controllers/         # Lógica de negocio
│   │   ├── routes/              # Rutas API
│   │   ├── middleware/          # Middleware
│   │   └── server.js            # Servidor principal
│   ├── .env                     # Variables de entorno
│   └── package.json
│
├── lotus-notes-frontend/        # Frontend React
│   ├── src/
│   │   ├── api/                 # Configuración API
│   │   ├── components/          # Componentes
│   │   ├── pages/               # Páginas
│   │   └── App.jsx
│   └── package.json
│
├── backend-api-backup/          # Backup del proyecto original
├── PROPUESTA_LOTUS_NOTES.md     # Propuesta técnica
└── README.md                    # Este archivo
```

## 🔧 Instalación

### Requisitos Previos
- Node.js 16 o superior
- MySQL 8.0 o superior
- Git

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Angektam/Lotus-Notes.git
cd Lotus-Notes
```

### 2. Configurar Backend

```bash
cd lotus-notes-collab
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL
```

### 3. Crear Base de Datos

```sql
CREATE DATABASE lotus_notes_db;
```

### 4. Iniciar Backend

```bash
npm run dev  # Modo desarrollo (puerto 4000)
# o
npm start    # Modo producción
```

### 5. Configurar Frontend

```bash
cd ../lotus-notes-frontend
npm install
```

### 6. Iniciar Frontend

```bash
npm run dev  # Se abrirá en http://localhost:3000
```

## 📚 Uso

### Crear Usuario

1. Accede a `http://localhost:3000`
2. Haz clic en "Regístrate"
3. Completa el formulario de registro
4. Inicia sesión con tus credenciales

### Usuarios de Prueba

Puedes crear usuarios de prueba con PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"username":"admin","email":"admin@lotus.com","password":"123456","fullName":"Administrador","department":"IT"}'
```

**Credenciales:**
- Email: admin@lotus.com
- Contraseña: 123456

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Notas
- `GET /api/notes` - Listar mis notas
- `POST /api/notes` - Crear nota
- `PUT /api/notes/:id` - Actualizar nota
- `DELETE /api/notes/:id` - Eliminar nota

### Tareas
- `GET /api/tasks/my-tasks` - Mis tareas
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea

### Calendario
- `GET /api/calendar` - Listar eventos
- `POST /api/calendar` - Crear evento
- `PUT /api/calendar/:id` - Actualizar evento
- `DELETE /api/calendar/:id` - Eliminar evento

### Mensajes
- `GET /api/messages/inbox` - Bandeja de entrada
- `GET /api/messages/sent` - Mensajes enviados
- `POST /api/messages` - Enviar mensaje
- `PUT /api/messages/:id/read` - Marcar como leído

## 🧪 Pruebas

Ejecuta el script de pruebas automatizado:

```powershell
cd lotus-notes-collab
.\test-api.ps1
```

## 🔒 Seguridad

- Autenticación JWT con tokens de 24 horas
- Contraseñas encriptadas con bcrypt (10 rounds)
- Validación de datos en todas las entradas
- CORS configurado
- Variables de entorno para credenciales sensibles

## 📈 Roadmap

- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Adjuntar archivos a notas y mensajes
- [ ] Búsqueda avanzada
- [ ] Exportación de datos (PDF, Excel)
- [ ] Aplicación móvil
- [ ] Integración con email externo
- [ ] Dashboard de analíticas

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👤 Autor

**Angektam**
- GitHub: [@Angektam](https://github.com/Angektam)

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en GitHub.

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!
