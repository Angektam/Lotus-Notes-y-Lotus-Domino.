# PROPUESTA TÉCNICA: SISTEMA LOTUS DOMINO
## Gestión de Reportes Supervisor-Brigadista

---

## 1. RESUMEN EJECUTIVO

Sistema de gestión de reportes inspirado en Lotus Notes/Domino que implementa un flujo de trabajo colaborativo entre Supervisores y Brigadistas, con capacidades de workflow, notificaciones, versionado de documentos y seguimiento de estados.

---

## 2. CONCEPTOS LOTUS NOTES/DOMINO APLICADOS

### 2.1 Arquitectura Lotus Domino
**Lotus Domino Server (Backend):**
- Base de datos documental (NSF - Notes Storage Facility)
- Motor de workflow y routing de documentos
- Sistema de replicación y sincronización
- Seguridad basada en ACL (Access Control Lists)

**Lotus Notes Client (Frontend):**
- Interfaz de usuario para acceso a documentos
- Vistas personalizadas por rol
- Formularios dinámicos
- Agentes automáticos

### 2.2 Elementos Clave Implementados

**Documentos (Documents):**
- Cada reporte es un documento con campos estructurados
- Metadatos: autor, fecha creación, estado, versión
- Historial de cambios y revisiones

**Vistas (Views):**
- Vista Supervisor: Todos los reportes pendientes de revisión
- Vista Brigadista: Mis reportes asignados
- Vista por Estado: Borrador, Enviado, En Revisión, Observado, Aprobado
- Vista por Fecha de Entrega: Ordenados por deadline

**Workflow (Flujo de Trabajo):**
- Estados del documento con transiciones controladas
- Notificaciones automáticas en cada cambio de estado
- Routing automático según rol y acción

**ACL (Control de Acceso):**
- Supervisor: Crear, Leer, Editar, Eliminar, Aprobar/Rechazar
- Brigadista: Crear, Leer, Editar (solo propios), Enviar
- Sistema: Auditoría completa de acciones

**Agentes (Agents):**
- Recordatorios automáticos de fechas límite
- Notificaciones de cambios de estado
- Generación de reportes estadísticos
- Limpieza de documentos antiguos

---

## 3. ROLES Y PERMISOS

### 3.1 Supervisor
**Capacidades:**
- Registrar y dar de alta brigadistas
- Asignar reportes con fechas de entrega
- Revisar documentos entregados
- Aprobar o solicitar correcciones
- Ver dashboard con estadísticas
- Generar reportes consolidados
- Gestionar plantillas de reportes

**Acciones en el Sistema:**
- `CREATE` brigadistas
- `ASSIGN` reportes a brigadistas
- `REVIEW` documentos enviados
- `APPROVE` reportes correctos
- `REJECT` con observaciones
- `VIEW` historial completo

### 3.2 Brigadista
**Capacidades:**
- Ver reportes asignados
- Elaborar y editar reportes
- Subir documentos y evidencias
- Enviar reportes para revisión
- Ver observaciones del supervisor
- Corregir y reenviar documentos
- Consultar historial de versiones

**Acciones en el Sistema:**
- `VIEW` reportes asignados
- `CREATE/EDIT` contenido de reportes
- `UPLOAD` archivos adjuntos
- `SUBMIT` para revisión
- `RESUBMIT` con correcciones
- `VIEW` comentarios del supervisor

---

## 4. FLUJO DE TRABAJO (WORKFLOW)

### 4.1 Estados del Documento

```
1. ASIGNADO → Supervisor crea asignación
   ↓
2. EN ELABORACIÓN → Brigadista trabaja en el reporte
   ↓
3. ENVIADO → Brigadista envía para revisión
   ↓
4. EN REVISIÓN → Supervisor revisa el documento
   ↓
5a. OBSERVADO → Supervisor solicita correcciones
    ↓ (vuelve a EN ELABORACIÓN)
    └→ Brigadista corrige y reenvía
   
5b. APROBADO → Supervisor acepta el reporte
    └→ FIN DEL CICLO
```

### 4.2 Transiciones de Estado

| Estado Actual | Acción | Rol | Estado Siguiente |
|--------------|--------|-----|------------------|
| - | Asignar Reporte | Supervisor | ASIGNADO |
| ASIGNADO | Iniciar Elaboración | Brigadista | EN ELABORACIÓN |
| EN ELABORACIÓN | Enviar | Brigadista | ENVIADO |
| ENVIADO | Iniciar Revisión | Supervisor | EN REVISIÓN |
| EN REVISIÓN | Solicitar Correcciones | Supervisor | OBSERVADO |
| EN REVISIÓN | Aprobar | Supervisor | APROBADO |
| OBSERVADO | Corregir y Reenviar | Brigadista | ENVIADO |

### 4.3 Notificaciones Automáticas

**Eventos que generan notificaciones:**
- Reporte asignado → Email/Notificación al Brigadista
- Reporte enviado → Notificación al Supervisor
- Reporte observado → Email con comentarios al Brigadista
- Reporte aprobado → Confirmación al Brigadista
- Fecha límite próxima (3 días) → Recordatorio al Brigadista
- Fecha límite vencida → Alerta al Supervisor y Brigadista

---

## 5. MODELO DE DATOS (ESTILO LOTUS DOMINO)

### 5.1 Documento de Reporte (Report Document)

```javascript
{
  // Metadatos del Documento (Document Metadata)
  documentId: "UUID",
  documentType: "Report",
  form: "ReportForm",
  created: "2026-02-27T10:00:00Z",
  modified: "2026-02-27T15:30:00Z",
  
  // Control de Acceso (ACL)
  author: "brigadista_id",
  readers: ["brigadista_id", "supervisor_id"],
  editors: ["brigadista_id"],
  
  // Workflow
  status: "ENVIADO",
  workflowHistory: [
    {state: "ASIGNADO", date: "2026-02-20", by: "supervisor_id"},
    {state: "EN_ELABORACION", date: "2026-02-21", by: "brigadista_id"},
    {state: "ENVIADO", date: "2026-02-27", by: "brigadista_id"}
  ],
  
  // Asignación
  assignedTo: "brigadista_id",
  assignedBy: "supervisor_id",
  assignedDate: "2026-02-20",
  dueDate: "2026-03-01",
  
  // Contenido del Reporte
  title: "Reporte Mensual - Febrero 2026",
  description: "Actividades realizadas en febrero",
  period: {
    start: "2026-02-01",
    end: "2026-02-28"
  },
  
  // Datos Específicos del Brigadista
  brigadistaInfo: {
    name: "Juan Pérez",
    zone: "Zona Norte",
    team: "Equipo A"
  },
  
  // Actividades Realizadas
  activities: [
    {
      date: "2026-02-15",
      description: "Inspección de área",
      location: "Sector 5",
      findings: "Todo en orden"
    }
  ],
  
  // Evidencias (Attachments)
  attachments: [
    {
      filename: "foto_evidencia_1.jpg",
      size: 2048576,
      mimeType: "image/jpeg",
      uploadDate: "2026-02-27",
      url: "/uploads/reports/abc123/foto1.jpg"
    }
  ],
  
  // Revisión del Supervisor
  review: {
    reviewedBy: "supervisor_id",
    reviewedDate: "2026-02-28",
    status: "OBSERVADO",
    comments: "Falta incluir evidencia fotográfica del sector 3",
    observations: [
      {
        section: "Actividades",
        comment: "Agregar más detalle en la descripción",
        resolved: false
      }
    ]
  },
  
  // Versionado (Document Versioning)
  version: 2,
  previousVersions: ["report_v1_id"],
  
  // Auditoría
  auditTrail: [
    {action: "CREATE", by: "supervisor_id", date: "2026-02-20"},
    {action: "EDIT", by: "brigadista_id", date: "2026-02-25"},
    {action: "SUBMIT", by: "brigadista_id", date: "2026-02-27"},
    {action: "REVIEW", by: "supervisor_id", date: "2026-02-28"}
  ]
}
```

### 5.2 Documento de Usuario (User Document)

```javascript
{
  documentType: "User",
  form: "UserForm",
  
  userId: "UUID",
  username: "juan.perez",
  email: "juan.perez@example.com",
  fullName: "Juan Pérez García",
  
  role: "BRIGADISTA", // o "SUPERVISOR"
  
  // Información adicional según rol
  brigadistaProfile: {
    zone: "Zona Norte",
    team: "Equipo A",
    supervisor: "supervisor_id",
    startDate: "2025-01-15"
  },
  
  supervisorProfile: {
    managedZones: ["Zona Norte", "Zona Centro"],
    brigadistas: ["brigadista_1", "brigadista_2"],
    department: "Operaciones"
  },
  
  // Configuración de notificaciones
  notifications: {
    email: true,
    inApp: true,
    sms: false
  },
  
  status: "ACTIVE",
  created: "2025-01-15",
  lastLogin: "2026-02-27T09:00:00Z"
}
```

---

## 6. VISTAS DEL SISTEMA (LOTUS VIEWS)

### 6.1 Vista Supervisor: Reportes Pendientes

**Columnas:**
- Brigadista
- Título del Reporte
- Fecha Asignación
- Fecha Límite
- Estado
- Días Restantes
- Acciones

**Filtros:**
- Por estado
- Por brigadista
- Por fecha de entrega
- Vencidos / Por vencer

### 6.2 Vista Brigadista: Mis Reportes

**Columnas:**
- Título
- Periodo
- Fecha Límite
- Estado
- Última Modificación
- Observaciones Pendientes
- Acciones

### 6.3 Vista Administrador: Dashboard

**Métricas:**
- Total de reportes asignados
- Reportes aprobados / rechazados
- Reportes pendientes de revisión
- Reportes vencidos
- Tiempo promedio de aprobación
- Brigadistas con más observaciones
- Tasa de aprobación por brigadista

---

## 7. AGENTES AUTOMÁTICOS (LOTUS AGENTS)

### 7.1 Agente de Recordatorios

**Frecuencia:** Diario a las 8:00 AM

**Función:**
```javascript
// Buscar reportes próximos a vencer (3 días)
const reportsDueSoon = await Report.findAll({
  where: {
    dueDate: { [Op.between]: [today, threeDaysFromNow] },
    status: { [Op.in]: ['ASIGNADO', 'EN_ELABORACION', 'OBSERVADO'] }
  }
});

// Enviar notificaciones
for (const report of reportsDueSoon) {
  await sendNotification(report.assignedTo, {
    type: 'REMINDER',
    message: `Reporte "${report.title}" vence en ${daysRemaining} días`
  });
}
```

### 7.2 Agente de Alertas de Vencimiento

**Frecuencia:** Diario a las 9:00 AM

**Función:**
```javascript
// Buscar reportes vencidos
const overdueReports = await Report.findAll({
  where: {
    dueDate: { [Op.lt]: today },
    status: { [Op.notIn]: ['APROBADO'] }
  }
});

// Notificar a supervisor y brigadista
for (const report of overdueReports) {
  await sendNotification(report.assignedTo, {
    type: 'OVERDUE',
    priority: 'HIGH',
    message: `Reporte "${report.title}" está vencido`
  });
  
  await sendNotification(report.assignedBy, {
    type: 'OVERDUE_ALERT',
    message: `Reporte de ${report.brigadista} está vencido`
  });
}
```

### 7.3 Agente de Estadísticas

**Frecuencia:** Semanal (Lunes 7:00 AM)

**Función:**
```javascript
// Generar reporte semanal para supervisores
const weeklyStats = {
  reportsAssigned: count,
  reportsApproved: count,
  reportsRejected: count,
  averageReviewTime: hours,
  brigadistaPerformance: [...]
};

await sendWeeklyReport(supervisorEmail, weeklyStats);
```

---

## 8. API ENDPOINTS

### 8.1 Autenticación
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### 8.2 Gestión de Usuarios (Supervisor)
```
POST   /api/users/brigadistas          # Registrar brigadista
GET    /api/users/brigadistas          # Listar brigadistas
PUT    /api/users/brigadistas/:id      # Actualizar brigadista
DELETE /api/users/brigadistas/:id      # Eliminar brigadista
GET    /api/users/brigadistas/:id/stats # Estadísticas del brigadista
```

### 8.3 Gestión de Reportes (Supervisor)
```
POST   /api/reports/assign             # Asignar reporte a brigadista
GET    /api/reports/pending-review     # Reportes pendientes de revisión
GET    /api/reports/:id                # Ver reporte específico
PUT    /api/reports/:id/review         # Revisar reporte
POST   /api/reports/:id/approve        # Aprobar reporte
POST   /api/reports/:id/reject         # Rechazar con observaciones
GET    /api/reports/statistics         # Dashboard de estadísticas
```

### 8.4 Gestión de Reportes (Brigadista)
```
GET    /api/reports/my-reports         # Mis reportes asignados
GET    /api/reports/:id                # Ver reporte específico
PUT    /api/reports/:id                # Editar reporte
POST   /api/reports/:id/submit         # Enviar para revisión
POST   /api/reports/:id/attachments    # Subir evidencias
GET    /api/reports/:id/history        # Ver historial de versiones
```

### 8.5 Notificaciones
```
GET    /api/notifications              # Listar notificaciones
PUT    /api/notifications/:id/read     # Marcar como leída
DELETE /api/notifications/:id          # Eliminar notificación
```

---

## 9. TECNOLOGÍAS

### Backend (Lotus Domino Server)
- **Node.js + Express.js** - Servidor API REST
- **MySQL + Sequelize ORM** - Base de datos documental
- **JWT** - Autenticación y autorización
- **Node-cron** - Agentes automáticos programados
- **Nodemailer** - Sistema de notificaciones por email
- **Socket.io** - Notificaciones en tiempo real
- **Multer** - Carga de archivos adjuntos

### Frontend (Lotus Notes Client)
- **React 18 + Vite** - Interfaz de usuario
- **React Router** - Navegación y rutas protegidas
- **Axios** - Comunicación con API
- **React Query** - Gestión de estado y caché
- **Socket.io-client** - Notificaciones en tiempo real
- **React Hook Form** - Formularios dinámicos
- **TailwindCSS** - Diseño responsive

---

## 10. ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                   LOTUS NOTES CLIENT                     │
│                    (React Frontend)                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Supervisor  │  │  Brigadista  │  │    Admin     │  │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Vistas (Views) por Rol                   │  │
│  │  • Reportes Pendientes  • Mis Reportes           │  │
│  │  • Por Estado           • Por Fecha              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                  LOTUS DOMINO SERVER                     │
│                   (Node.js Backend)                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │           Workflow Engine                        │  │
│  │  • Estado de documentos  • Transiciones          │  │
│  │  • Routing automático    • Validaciones          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Agentes Automáticos (Cron)             │  │
│  │  • Recordatorios  • Alertas  • Estadísticas      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Sistema de Notificaciones              │  │
│  │  • Email  • In-App  • WebSocket Real-time        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS DOCUMENTAL                    │
│                    (MySQL)                               │
├─────────────────────────────────────────────────────────┤
│  • Users (Supervisores, Brigadistas)                    │
│  • Reports (Documentos con workflow)                    │
│  • Attachments (Evidencias)                             │
│  • Notifications (Notificaciones)                       │
│  • AuditLog (Auditoría completa)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 11. IMPLEMENTACIÓN DEL MODELO DE DATOS

### 11.1 Modelo Report (Sequelize)

```javascript
const Report = sequelize.define('Report', {
  // Identificación del documento
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  documentType: {
    type: DataTypes.STRING,
    defaultValue: 'Report'
  },
  
  // Asignación
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  assignedDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  // Contenido
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  periodStart: {
    type: DataTypes.DATE
  },
  periodEnd: {
    type: DataTypes.DATE
  },
  
  // Información del Brigadista
  brigadistaInfo: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  
  // Actividades realizadas
  activities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  // Workflow
  status: {
    type: DataTypes.ENUM(
      'ASIGNADO',
      'EN_ELABORACION',
      'ENVIADO',
      'EN_REVISION',
      'OBSERVADO',
      'APROBADO'
    ),
    defaultValue: 'ASIGNADO'
  },
  workflowHistory: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  // Revisión
  reviewedBy: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  },
  reviewedDate: {
    type: DataTypes.DATE
  },
  reviewComments: {
    type: DataTypes.TEXT
  },
  observations: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  // Versionado
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  previousVersionId: {
    type: DataTypes.UUID
  },
  
  // Auditoría
  auditTrail: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'reports',
  timestamps: true
});
```

### 11.2 Modelo User (Sequelize)

```javascript
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('SUPERVISOR', 'BRIGADISTA', 'ADMIN'),
    allowNull: false
  },
  
  // Perfil de Brigadista
  brigadistaProfile: {
    type: DataTypes.JSON,
    defaultValue: null
    // { zone, team, supervisor, startDate }
  },
  
  // Perfil de Supervisor
  supervisorProfile: {
    type: DataTypes.JSON,
    defaultValue: null
    // { managedZones, brigadistas, department }
  },
  
  // Configuración
  notifications: {
    type: DataTypes.JSON,
    defaultValue: { email: true, inApp: true, sms: false }
  },
  
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
    defaultValue: 'ACTIVE'
  },
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  timestamps: true
});
```

### 11.3 Modelo Attachment (Sequelize)

```javascript
const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reportId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Reports', key: 'id' }
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    references: { model: 'Users', key: 'id' }
  }
}, {
  tableName: 'attachments',
  timestamps: true
});
```

### 11.4 Modelo Notification (Sequelize)

```javascript
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  type: {
    type: DataTypes.ENUM(
      'REPORT_ASSIGNED',
      'REPORT_SUBMITTED',
      'REPORT_APPROVED',
      'REPORT_REJECTED',
      'REMINDER',
      'OVERDUE'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  relatedReportId: {
    type: DataTypes.UUID,
    references: { model: 'Reports', key: 'id' }
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    defaultValue: 'MEDIUM'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'notifications',
  timestamps: true
});
```

---

## 12. CONTROLADORES PRINCIPALES

### 12.1 Supervisor Controller

```javascript
// Asignar reporte a brigadista
exports.assignReport = async (req, res) => {
  const { brigadistaId, title, description, dueDate, periodStart, periodEnd } = req.body;
  
  const report = await Report.create({
    assignedTo: brigadistaId,
    assignedBy: req.user.id,
    assignedDate: new Date(),
    dueDate,
    title,
    description,
    periodStart,
    periodEnd,
    status: 'ASIGNADO',
    workflowHistory: [{
      state: 'ASIGNADO',
      date: new Date(),
      by: req.user.id
    }],
    auditTrail: [{
      action: 'CREATE',
      by: req.user.id,
      date: new Date()
    }]
  });
  
  // Notificar al brigadista
  await createNotification({
    userId: brigadistaId,
    type: 'REPORT_ASSIGNED',
    title: 'Nuevo reporte asignado',
    message: `Se te ha asignado el reporte: ${title}`,
    relatedReportId: report.id
  });
  
  res.status(201).json({ success: true, data: report });
};
```

```javascript
// Revisar y aprobar/rechazar reporte
exports.reviewReport = async (req, res) => {
  const { id } = req.params;
  const { action, comments, observations } = req.body; // action: 'APPROVE' | 'REJECT'
  
  const report = await Report.findByPk(id);
  
  if (!report || report.status !== 'ENVIADO') {
    return res.status(400).json({ 
      success: false, 
      message: 'Reporte no disponible para revisión' 
    });
  }
  
  const newStatus = action === 'APPROVE' ? 'APROBADO' : 'OBSERVADO';
  
  // Actualizar reporte
  await report.update({
    status: newStatus,
    reviewedBy: req.user.id,
    reviewedDate: new Date(),
    reviewComments: comments,
    observations: observations || [],
    workflowHistory: [
      ...report.workflowHistory,
      {
        state: newStatus,
        date: new Date(),
        by: req.user.id,
        comments
      }
    ],
    auditTrail: [
      ...report.auditTrail,
      {
        action: action === 'APPROVE' ? 'APPROVE' : 'REJECT',
        by: req.user.id,
        date: new Date()
      }
    ]
  });
  
  // Notificar al brigadista
  await createNotification({
    userId: report.assignedTo,
    type: action === 'APPROVE' ? 'REPORT_APPROVED' : 'REPORT_REJECTED',
    title: action === 'APPROVE' ? 'Reporte aprobado' : 'Reporte con observaciones',
    message: action === 'APPROVE' 
      ? `Tu reporte "${report.title}" ha sido aprobado`
      : `Tu reporte "${report.title}" requiere correcciones: ${comments}`,
    relatedReportId: report.id,
    priority: action === 'APPROVE' ? 'LOW' : 'HIGH'
  });
  
  res.json({ success: true, data: report });
};

// Obtener reportes pendientes de revisión
exports.getPendingReports = async (req, res) => {
  const reports = await Report.findAll({
    where: { 
      status: 'ENVIADO',
      assignedBy: req.user.id 
    },
    include: [{
      model: User,
      as: 'brigadista',
      attributes: ['id', 'fullName', 'email']
    }],
    order: [['dueDate', 'ASC']]
  });
  
  res.json({ success: true, data: reports });
};
```

### 12.2 Brigadista Controller

```javascript
// Obtener mis reportes asignados
exports.getMyReports = async (req, res) => {
  const reports = await Report.findAll({
    where: { assignedTo: req.user.id },
    include: [{
      model: User,
      as: 'supervisor',
      attributes: ['id', 'fullName', 'email']
    }],
    order: [['dueDate', 'ASC']]
  });
  
  res.json({ success: true, data: reports });
};

// Actualizar reporte (elaborar/corregir)
exports.updateReport = async (req, res) => {
  const { id } = req.params;
  const { description, activities, brigadistaInfo } = req.body;
  
  const report = await Report.findOne({
    where: { 
      id, 
      assignedTo: req.user.id,
      status: { [Op.in]: ['ASIGNADO', 'EN_ELABORACION', 'OBSERVADO'] }
    }
  });
  
  if (!report) {
    return res.status(404).json({ 
      success: false, 
      message: 'Reporte no encontrado o no editable' 
    });
  }
  
  // Cambiar estado a EN_ELABORACION si está ASIGNADO
  const newStatus = report.status === 'ASIGNADO' ? 'EN_ELABORACION' : report.status;
  
  await report.update({
    description,
    activities,
    brigadistaInfo,
    status: newStatus,
    version: report.version + 1,
    workflowHistory: report.status === 'ASIGNADO' 
      ? [...report.workflowHistory, {
          state: 'EN_ELABORACION',
          date: new Date(),
          by: req.user.id
        }]
      : report.workflowHistory,
    auditTrail: [
      ...report.auditTrail,
      {
        action: 'EDIT',
        by: req.user.id,
        date: new Date()
      }
    ]
  });
  
  res.json({ success: true, data: report });
};

// Enviar reporte para revisión
exports.submitReport = async (req, res) => {
  const { id } = req.params;
  
  const report = await Report.findOne({
    where: { 
      id, 
      assignedTo: req.user.id,
      status: { [Op.in]: ['EN_ELABORACION', 'OBSERVADO'] }
    }
  });
  
  if (!report) {
    return res.status(404).json({ 
      success: false, 
      message: 'Reporte no encontrado o no enviable' 
    });
  }
  
  await report.update({
    status: 'ENVIADO',
    workflowHistory: [
      ...report.workflowHistory,
      {
        state: 'ENVIADO',
        date: new Date(),
        by: req.user.id
      }
    ],
    auditTrail: [
      ...report.auditTrail,
      {
        action: 'SUBMIT',
        by: req.user.id,
        date: new Date()
      }
    ]
  });
  
  // Notificar al supervisor
  await createNotification({
    userId: report.assignedBy,
    type: 'REPORT_SUBMITTED',
    title: 'Reporte enviado para revisión',
    message: `${req.user.fullName} ha enviado el reporte: ${report.title}`,
    relatedReportId: report.id,
    priority: 'MEDIUM'
  });
  
  res.json({ success: true, data: report });
};
```

---

## 13. AGENTES AUTOMÁTICOS (IMPLEMENTACIÓN)

### 13.1 Configuración de Cron Jobs

```javascript
// src/agents/scheduler.js
const cron = require('node-cron');
const reminderAgent = require('./reminderAgent');
const overdueAgent = require('./overdueAgent');
const statsAgent = require('./statsAgent');

// Recordatorios diarios a las 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Ejecutando agente de recordatorios...');
  await reminderAgent.run();
});

// Alertas de vencimiento diarias a las 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Ejecutando agente de alertas...');
  await overdueAgent.run();
});

// Estadísticas semanales (Lunes 7:00 AM)
cron.schedule('0 7 * * 1', async () => {
  console.log('Ejecutando agente de estadísticas...');
  await statsAgent.run();
});
```

### 13.2 Agente de Recordatorios

```javascript
// src/agents/reminderAgent.js
const { Report, User } = require('../models');
const { Op } = require('sequelize');
const { sendEmail, createNotification } = require('../services/notificationService');

exports.run = async () => {
  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  
  // Buscar reportes próximos a vencer
  const reportsDueSoon = await Report.findAll({
    where: {
      dueDate: { 
        [Op.between]: [today, threeDaysFromNow] 
      },
      status: { 
        [Op.in]: ['ASIGNADO', 'EN_ELABORACION', 'OBSERVADO'] 
      }
    },
    include: [{
      model: User,
      as: 'brigadista',
      attributes: ['id', 'fullName', 'email']
    }]
  });
  
  for (const report of reportsDueSoon) {
    const daysRemaining = Math.ceil(
      (report.dueDate - today) / (1000 * 60 * 60 * 24)
    );
    
    // Crear notificación en la app
    await createNotification({
      userId: report.assignedTo,
      type: 'REMINDER',
      title: 'Recordatorio de entrega',
      message: `El reporte "${report.title}" vence en ${daysRemaining} día(s)`,
      relatedReportId: report.id,
      priority: daysRemaining <= 1 ? 'HIGH' : 'MEDIUM'
    });
    
    // Enviar email
    await sendEmail({
      to: report.brigadista.email,
      subject: `Recordatorio: Reporte vence en ${daysRemaining} día(s)`,
      template: 'reminder',
      data: {
        brigadistaName: report.brigadista.fullName,
        reportTitle: report.title,
        dueDate: report.dueDate,
        daysRemaining
      }
    });
  }
  
  console.log(`Recordatorios enviados: ${reportsDueSoon.length}`);
};
```

### 13.3 Agente de Alertas de Vencimiento

```javascript
// src/agents/overdueAgent.js
const { Report, User } = require('../models');
const { Op } = require('sequelize');
const { sendEmail, createNotification } = require('../services/notificationService');

exports.run = async () => {
  const today = new Date();
  
  // Buscar reportes vencidos
  const overdueReports = await Report.findAll({
    where: {
      dueDate: { [Op.lt]: today },
      status: { [Op.notIn]: ['APROBADO'] }
    },
    include: [
      {
        model: User,
        as: 'brigadista',
        attributes: ['id', 'fullName', 'email']
      },
      {
        model: User,
        as: 'supervisor',
        attributes: ['id', 'fullName', 'email']
      }
    ]
  });
  
  for (const report of overdueReports) {
    const daysOverdue = Math.ceil(
      (today - report.dueDate) / (1000 * 60 * 60 * 24)
    );
    
    // Notificar al brigadista
    await createNotification({
      userId: report.assignedTo,
      type: 'OVERDUE',
      title: 'Reporte vencido',
      message: `El reporte "${report.title}" está vencido por ${daysOverdue} día(s)`,
      relatedReportId: report.id,
      priority: 'HIGH'
    });
    
    await sendEmail({
      to: report.brigadista.email,
      subject: `URGENTE: Reporte vencido`,
      template: 'overdue',
      data: {
        brigadistaName: report.brigadista.fullName,
        reportTitle: report.title,
        dueDate: report.dueDate,
        daysOverdue
      }
    });
    
    // Notificar al supervisor
    await createNotification({
      userId: report.assignedBy,
      type: 'OVERDUE',
      title: 'Reporte vencido - Alerta',
      message: `Reporte de ${report.brigadista.fullName} vencido por ${daysOverdue} día(s)`,
      relatedReportId: report.id,
      priority: 'HIGH'
    });
  }
  
  console.log(`Alertas de vencimiento enviadas: ${overdueReports.length}`);
};
```

---

## 14. INTERFAZ DE USUARIO (VISTAS)

### 14.1 Dashboard Supervisor

**Componentes principales:**
- Resumen de estadísticas (cards)
  - Total reportes asignados
  - Pendientes de revisión
  - Aprobados este mes
  - Vencidos
- Tabla de reportes pendientes de revisión
- Gráficas de rendimiento
- Lista de brigadistas con estadísticas

**Acciones disponibles:**
- Asignar nuevo reporte
- Revisar reporte pendiente
- Ver historial de brigadista
- Generar reportes consolidados

### 14.2 Dashboard Brigadista

**Componentes principales:**
- Resumen personal
  - Reportes asignados
  - Reportes pendientes
  - Reportes aprobados
  - Próximos vencimientos
- Lista de reportes con estados
- Notificaciones recientes
- Calendario de entregas

**Acciones disponibles:**
- Elaborar reporte nuevo
- Continuar reporte en borrador
- Corregir reporte observado
- Ver historial de versiones

### 14.3 Formulario de Reporte (Brigadista)

**Secciones:**
1. Información general
   - Título
   - Periodo (fecha inicio - fin)
   - Descripción general

2. Información del brigadista
   - Zona asignada
   - Equipo
   - Datos de contacto

3. Actividades realizadas (tabla dinámica)
   - Fecha
   - Descripción
   - Ubicación
   - Hallazgos/Resultados
   - Botón "Agregar actividad"

4. Evidencias
   - Carga de archivos (drag & drop)
   - Vista previa de imágenes
   - Lista de documentos adjuntos

5. Observaciones
   - Campo de texto libre
   - Dificultades encontradas
   - Comentarios adicionales

**Botones de acción:**
- Guardar borrador
- Enviar para revisión
- Cancelar

### 14.4 Vista de Revisión (Supervisor)

**Información mostrada:**
- Datos del reporte completo
- Información del brigadista
- Historial de versiones
- Evidencias adjuntas
- Historial de workflow

**Formulario de revisión:**
- Comentarios generales
- Observaciones específicas por sección
- Decisión: Aprobar / Solicitar correcciones

**Botones de acción:**
- Aprobar reporte
- Rechazar con observaciones
- Volver a lista

---

## 15. SEGURIDAD Y CONTROL DE ACCESO

### 15.1 ACL (Access Control Lists)

**Nivel de Documento:**
```javascript
// Middleware para verificar acceso a reporte
const checkReportAccess = async (req, res, next) => {
  const { id } = req.params;
  const report = await Report.findByPk(id);
  
  if (!report) {
    return res.status(404).json({ message: 'Reporte no encontrado' });
  }
  
  const userRole = req.user.role;
  const userId = req.user.id;
  
  // Supervisor: puede ver reportes que asignó
  if (userRole === 'SUPERVISOR' && report.assignedBy === userId) {
    return next();
  }
  
  // Brigadista: solo puede ver sus propios reportes
  if (userRole === 'BRIGADISTA' && report.assignedTo === userId) {
    return next();
  }
  
  // Admin: puede ver todos
  if (userRole === 'ADMIN') {
    return next();
  }
  
  return res.status(403).json({ message: 'Acceso denegado' });
};
```

### 15.2 Validación de Transiciones de Estado

```javascript
// Validar que la transición de estado sea válida
const validateStateTransition = (currentState, newState, userRole) => {
  const validTransitions = {
    'ASIGNADO': {
      'EN_ELABORACION': ['BRIGADISTA']
    },
    'EN_ELABORACION': {
      'ENVIADO': ['BRIGADISTA']
    },
    'ENVIADO': {
      'EN_REVISION': ['SUPERVISOR'],
      'OBSERVADO': ['SUPERVISOR'],
      'APROBADO': ['SUPERVISOR']
    },
    'OBSERVADO': {
      'EN_ELABORACION': ['BRIGADISTA'],
      'ENVIADO': ['BRIGADISTA']
    }
  };
  
  const allowedRoles = validTransitions[currentState]?.[newState];
  return allowedRoles && allowedRoles.includes(userRole);
};
```

### 15.3 Auditoría Completa

Todas las acciones quedan registradas en el campo `auditTrail`:
- Creación del documento
- Cada edición
- Cambios de estado
- Revisiones
- Aprobaciones/Rechazos
- Usuario que realizó la acción
- Fecha y hora exacta

---

## 16. INSTALACIÓN Y CONFIGURACIÓN

### 16.1 Requisitos Previos
- Node.js 18+
- MySQL 8.0+
- npm o yarn

### 16.2 Instalación Backend

```bash
cd lotus-notes-collab
npm install

# Instalar dependencias adicionales
npm install node-cron nodemailer socket.io multer
```

### 16.3 Configuración .env

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=lotus_domino_db
DB_PORT=3306

# JWT
JWT_SECRET=tu_secret_key_muy_segura
JWT_EXPIRES_IN=24h

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Server
PORT=4000
NODE_ENV=development
```

### 16.4 Crear Base de Datos

```sql
CREATE DATABASE lotus_domino_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 16.5 Ejecutar Migraciones

```bash
npm run migrate
# o si usas Sequelize CLI
npx sequelize-cli db:migrate
```

### 16.6 Crear Usuario Supervisor Inicial

```bash
node scripts/create-supervisor.js
```

### 16.7 Iniciar Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### 16.8 Instalación Frontend

```bash
cd lotus-notes-frontend
npm install

# Instalar dependencias adicionales
npm install react-query socket.io-client react-hook-form
```

### 16.9 Configuración Frontend

```javascript
// src/config/api.js
export const API_URL = 'http://localhost:4000/api';
export const SOCKET_URL = 'http://localhost:4000';
```

### 16.10 Iniciar Frontend

```bash
npm run dev
```

---

## 17. ESTRUCTURA DE DIRECTORIOS

```
lotus-domino-system/
├── backend/
│   ├── src/
│   │   ├── agents/              # Agentes automáticos (Cron)
│   │   │   ├── scheduler.js
│   │   │   ├── reminderAgent.js
│   │   │   ├── overdueAgent.js
│   │   │   └── statsAgent.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── email.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── supervisor.controller.js
│   │   │   ├── brigadista.controller.js
│   │   │   ├── report.controller.js
│   │   │   └── notification.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── checkRole.js
│   │   │   └── checkReportAccess.js
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── User.js
│   │   │   ├── Report.js
│   │   │   ├── Attachment.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── supervisor.routes.js
│   │   │   ├── brigadista.routes.js
│   │   │   └── notification.routes.js
│   │   ├── services/
│   │   │   ├── notificationService.js
│   │   │   ├── emailService.js
│   │   │   └── workflowService.js
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   └── server.js
│   ├── uploads/                 # Archivos subidos
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NotificationBell.jsx
    │   │   └── ReportCard.jsx
    │   ├── pages/
    │   │   ├── supervisor/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── AssignReport.jsx
    │   │   │   ├── ReviewReport.jsx
    │   │   │   └── BrigadistaManagement.jsx
    │   │   ├── brigadista/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── MyReports.jsx
    │   │   │   ├── EditReport.jsx
    │   │   │   └── ReportHistory.jsx
    │   │   └── Login.jsx
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   ├── useReports.js
    │   │   └── useNotifications.js
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 18. COMPARACIÓN: LOTUS NOTES/DOMINO vs IMPLEMENTACIÓN

| Característica Lotus | Implementación en Sistema |
|---------------------|---------------------------|
| NSF Database | MySQL con Sequelize ORM |
| Document-centric | Modelo Report con JSON fields |
| Views | Queries con filtros y ordenamiento |
| Forms | React components con validación |
| Workflow Engine | Estado + Transiciones controladas |
| ACL | Middleware de autenticación/autorización |
| Agents | Node-cron + funciones programadas |
| Replication | No implementado (single server) |
| Email notifications | Nodemailer |
| Real-time updates | Socket.io |

---

## 19. VENTAJAS DEL SISTEMA

✓ **Workflow automatizado** inspirado en Lotus Domino
✓ **Control de acceso granular** por rol y documento
✓ **Versionado completo** de documentos
✓ **Auditoría exhaustiva** de todas las acciones
✓ **Notificaciones automáticas** en tiempo real
✓ **Agentes programados** para recordatorios y alertas
✓ **Interfaz moderna** y responsive
✓ **Arquitectura escalable** y mantenible
✓ **Bajo costo** de implementación y operación
✓ **Fácil personalización** según necesidades

---

## 20. ROADMAP DE MEJORAS

### Fase 1 (Actual)
- ✓ Sistema básico de workflow
- ✓ Roles Supervisor/Brigadista
- ✓ Notificaciones por email
- ✓ Agentes automáticos

### Fase 2 (3 meses)
- Notificaciones push en tiempo real
- Dashboard con gráficas avanzadas
- Exportación de reportes a PDF/Excel
- Firma digital de documentos
- Aplicación móvil (React Native)

### Fase 3 (6 meses)
- Integración con sistemas externos
- API pública para integraciones
- Reportes predictivos con IA
- Sistema de replicación multi-servidor
- Módulo de capacitación integrado

### Fase 4 (12 meses)
- Workflow configurable sin código
- Plantillas personalizables de reportes
- Sistema de evaluación de desempeño
- Integración con geolocalización
- Módulo de planificación de rutas

---

## 21. COSTOS ESTIMADOS

### Desarrollo
- Implementación inicial: $3,000 - $5,000 USD
- Personalización adicional: $500 - $1,000 USD

### Operación Mensual
- VPS (4GB RAM, 80GB SSD): $20 - $40 USD
- Base de datos MySQL: $10 - $20 USD
- Almacenamiento adicional: $5 - $10 USD
- Dominio y SSL: $2 - $5 USD
- Email service (SendGrid/Mailgun): $10 - $20 USD
- **Total: $47 - $95 USD/mes**

### Escalabilidad
- 100 usuarios: $50 USD/mes
- 500 usuarios: $100 USD/mes
- 1000+ usuarios: $200+ USD/mes

---

## 22. CONCLUSIÓN

Este sistema implementa los conceptos fundamentales de Lotus Notes y Lotus Domino en una arquitectura moderna web, proporcionando:

1. **Gestión documental** con workflow automatizado
2. **Control de acceso** basado en roles (ACL)
3. **Vistas personalizadas** según el rol del usuario
4. **Agentes automáticos** para tareas programadas
5. **Notificaciones** en tiempo real
6. **Auditoría completa** de todas las acciones
7. **Versionado** de documentos

El flujo Supervisor-Brigadista queda completamente implementado con todas las transiciones de estado, validaciones y notificaciones necesarias para un sistema robusto y profesional.

---

**Fecha:** 27 de Febrero, 2026
**Versión:** 1.0.0 - Sistema Lotus Domino Brigadistas
**Estado:** Propuesta Técnica Completa
**Autor:** Sistema de Gestión Lotus Domino

