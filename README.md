# 🌟 Sistema Lotus Domino - Gestión de Reportes

Sistema completo de gestión de reportes con workflow automatizado basado en **Lotus Notes/Domino**, implementando el flujo Supervisor-Brigadista con arquitectura documental y agentes automáticos.

![Estado](https://img.shields.io/badge/Estado-Funcional-success)
![Versión](https://img.shields.io/badge/Versión-2.0.0-blue)
![Node](https://img.shields.io/badge/Node-18+-green)
![React](https://img.shields.io/badge/React-18-blue)

---

## 📋 Descripción

Sistema web que **implementa los conceptos fundamentales de Lotus Notes/Domino** en una arquitectura moderna:

### Conceptos Lotus Notes/Domino Implementados:

**🗄️ Base de Datos Documental (NSF)**
- Cada reporte es un documento con campos estructurados y JSON
- Metadatos completos: autor, fechas, versión, estado
- Almacenamiento en MySQL con estructura documental

**📊 Vistas (Views)**
- Vista Supervisor: Reportes pendientes de revisión
- Vista Brigadista: Mis reportes asignados
- Vistas filtradas por estado, fecha, usuario
- Ordenamiento y búsqueda avanzada

**🔄 Motor de Workflow**
- Estados controlados con transiciones validadas
- Routing automático según rol y acción
- Historial completo de cambios (workflowHistory)
- Validación de permisos en cada transición

**🔐 Control de Acceso (ACL)**
- Permisos granulares por rol y documento
- Supervisores: Crear, Asignar, Revisar, Aprobar/Rechazar
- Brigadistas: Leer, Editar (propios), Enviar
- Auditoría completa de accesos

**🤖 Agentes Automáticos (Agents)**
- Agente de Recordatorios (diario 8:00 AM)
- Agente de Alertas de Vencimiento (diario 9:00 AM)
- Agente de Estadísticas (semanal)
- Programación con node-cron

**📝 Formularios Dinámicos (Forms)**
- Formularios estructurados para reportes
- Validación de campos
- Campos calculados automáticamente

**🔔 Notificaciones Automáticas**
- Notificaciones en cada cambio de estado
- Sistema de prioridades (LOW, MEDIUM, HIGH)
- Almacenamiento persistente

**📚 Versionado de Documentos**
- Control de versiones automático
- Referencia a versiones anteriores
- Historial de cambios completo

**🔍 Auditoría (Audit Trail)**
- Registro de todas las acciones
- Usuario, fecha, acción, detalles
- Trazabilidad completa

---

## 🎯 Comparación: Lotus Notes/Domino vs Este Sistema

| Concepto Lotus Notes/Domino | Implementación en el Sistema |
|------------------------------|------------------------------|
| **NSF Database** | MySQL con estructura documental (JSON) |
| **Documents** | Modelo Report con campos estructurados |
| **Views** | Queries con filtros, ordenamiento y búsqueda |
| **Forms** | Componentes React + API REST |
| **Workflow Engine** | Estados + Transiciones controladas |
| **ACL (Access Control)** | Middleware de autenticación/autorización |
| **Agents** | Node-cron + funciones programadas |
| **Replication** | No implementado (single server) |
| **Email Notifications** | Estructura lista (Nodemailer) |
| **Real-time Updates** | Preparado para Socket.io |

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- MySQL 8.0+
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Angektam/Lotus-Notes-y-Lotus-Domino..git
cd Lotus-Notes-y-Lotus-Domino.
```

### 2. Configurar Backend
```bash
cd lotus-notes-collab
npm install
cp .env.example .env
# Editar .env con tus credenciales de MySQL
npm run setup
npm run create-users
npm run dev
```

### 3. Configurar Frontend
```bash
cd ../lotus-notes-frontend
npm install
npm run dev
```

### 4. Acceder al Sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

---

## 👥 Usuarios de Prueba

| Usuario | Password | Rol |
|---------|----------|-----|
| supervisor1 | supervisor123 | Supervisor |
| brigadista1 | brigadista123 | Brigadista |
| brigadista2 | brigadista123 | Brigadista |
| admin | admin123 | Admin |

---

## 🔄 Workflow Implementado

```
ASIGNADO → EN_ELABORACION → ENVIADO → EN_REVISION
                                           ↓
                                    ┌──────┴──────┐
                                    ↓             ↓
                                OBSERVADO     APROBADO
                                    ↓
                            (vuelve a EN_ELABORACION)
```

---

## 📁 Estructura del Proyecto

```
├── lotus-notes-collab/          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── agents/              # Agentes automáticos (cron)
│   │   ├── controllers/         # Controladores
│   │   ├── models/              # Modelos Sequelize
│   │   ├── routes/              # Rutas API
│   │   └── middleware/          # Middlewares
│   ├── uploads/                 # Archivos subidos
│   └── package.json
│
├── lotus-notes-frontend/        # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/                 # Configuración Axios
│   │   ├── components/          # Componentes React
│   │   └── pages/               # Páginas
│   └── package.json
│
└── README.md
```

---

## 🎯 Características Principales

### Backend
- **API REST**: 22+ endpoints
- **Autenticación**: JWT
- **Base de Datos**: MySQL con Sequelize ORM
- **Workflow**: Estados y transiciones controladas
- **Notificaciones**: Sistema completo de notificaciones
- **Agentes**: Recordatorios y alertas automáticas
- **Archivos**: Carga de evidencias (5MB max)
- **Auditoría**: Registro completo de acciones

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router
- **HTTP Client**: Axios
- **UI**: Diseño responsive y moderno
- **Autenticación**: Login con username o email

---

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Supervisor
- `POST /api/supervisor/brigadistas` - Registrar brigadista
- `GET /api/supervisor/brigadistas` - Listar brigadistas
- `POST /api/supervisor/reports/assign` - Asignar reporte
- `GET /api/supervisor/reports/pending` - Reportes pendientes
- `PUT /api/supervisor/reports/:id/review` - Revisar reporte
- `GET /api/supervisor/dashboard/stats` - Estadísticas

### Brigadista
- `GET /api/brigadista/reports` - Mis reportes
- `PUT /api/brigadista/reports/:id` - Editar reporte
- `POST /api/brigadista/reports/:id/submit` - Enviar
- `POST /api/brigadista/reports/:id/attachments` - Subir archivo
- `GET /api/brigadista/dashboard/stats` - Mis estadísticas

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/:id/read` - Marcar leída
- `GET /api/notifications/unread-count` - Contador

---

## 🧪 Pruebas

### Test Automático del Workflow
```powershell
cd lotus-notes-collab
.\test-simple.ps1
```

Este script ejecuta un flujo completo:
1. Login Supervisor
2. Asignar reporte
3. Login Brigadista
4. Elaborar y enviar reporte
5. Supervisor aprueba

---

## 🤖 Agentes Automáticos

Los agentes se ejecutan automáticamente:

- **Recordatorios**: Diario 8:00 AM
  - Notifica reportes que vencen en 3 días

- **Alertas**: Diario 9:00 AM
  - Notifica reportes vencidos

- **Modo Desarrollo**: Cada hora

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lotus_domino_db
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=4000
NODE_ENV=development
```

---

## 📚 Documentación

- [Guía Rápida](lotus-notes-collab/GUIA_RAPIDA.md)
- [Documentación Completa](lotus-notes-collab/README_LOTUS_DOMINO.md)
- [Propuesta Técnica](PROPUESTA_LOTUS_DOMINO_BRIGADISTAS.md)
- [Credenciales de Acceso](CREDENCIALES_LOGIN.md)
- [Estado del Sistema](lotus-notes-collab/SISTEMA_FUNCIONANDO.md)

---

## 🛠️ Tecnologías

### Backend
- Node.js + Express.js
- MySQL + Sequelize ORM
- JWT Authentication
- Bcrypt
- Node-cron
- Multer

### Frontend
- React 18
- Vite
- React Router
- Axios
- CSS3

---

## 🔐 Seguridad

- Autenticación JWT
- Contraseñas encriptadas (bcrypt)
- Control de acceso por rol
- Validación de inputs
- CORS configurado
- Archivos validados (tipo y tamaño)

---

## 📈 Roadmap

- [ ] Notificaciones en tiempo real (Socket.io)
- [ ] Generación de PDF de reportes
- [ ] Dashboard con gráficas
- [ ] Aplicación móvil
- [ ] Firma digital
- [ ] Integración con email

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

**Angektam**
- GitHub: [@Angektam](https://github.com/Angektam)

---

## 🙏 Agradecimientos

Este sistema **implementa los conceptos fundamentales de Lotus Notes/Domino** de IBM en tecnologías web modernas (Node.js, React, MySQL), demostrando que los principios de arquitectura documental, workflow automatizado y agentes programados siguen siendo relevantes y poderosos en aplicaciones modernas.

**Lotus Notes/Domino** fue pionero en:
- Bases de datos documentales
- Workflow automatizado
- Colaboración empresarial
- Agentes inteligentes
- Replicación de datos

Este proyecto adapta esos conceptos probados a un stack tecnológico actual y accesible.

---

**Fecha:** Febrero 2026
**Versión:** 2.0.0
**Estado:** ✅ Funcional y Probado
