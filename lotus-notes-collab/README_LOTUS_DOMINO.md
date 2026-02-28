# Sistema Lotus Domino - Supervisor-Brigadista

Sistema de gestión de reportes con workflow automatizado inspirado en Lotus Notes/Domino.

## Características Principales

- ✅ Workflow completo Supervisor-Brigadista
- ✅ Estados: ASIGNADO → EN_ELABORACION → ENVIADO → EN_REVISION → OBSERVADO/APROBADO
- ✅ Notificaciones automáticas en tiempo real
- ✅ Agentes programados (recordatorios y alertas)
- ✅ Versionado de documentos
- ✅ Auditoría completa
- ✅ Control de acceso (ACL)
- ✅ Carga de archivos adjuntos

## Instalación

### 1. Instalar dependencias

```bash
cd lotus-notes-collab
npm install
```

### 2. Configurar base de datos

Crear base de datos MySQL:

```sql
CREATE DATABASE lotus_domino_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurar variables de entorno

Editar el archivo `.env`:

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

# Server
PORT=4000
NODE_ENV=development
```

### 4. Crear carpeta de uploads

```bash
mkdir uploads
```

### 5. Iniciar servidor (creará las tablas automáticamente)

```bash
npm run dev
```

### 6. Crear usuarios iniciales

En otra terminal:

```bash
node create-users.js
```

Esto creará:
- 1 Supervisor (supervisor1 / supervisor123)
- 2 Brigadistas (brigadista1, brigadista2 / brigadista123)
- 1 Admin (admin / admin123)

## API Endpoints

### Autenticación
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Supervisor
```
POST   /api/supervisor/brigadistas          # Registrar brigadista
GET    /api/supervisor/brigadistas          # Listar brigadistas
POST   /api/supervisor/reports/assign       # Asignar reporte
GET    /api/supervisor/reports/pending      # Reportes pendientes
GET    /api/supervisor/reports              # Todos los reportes
PUT    /api/supervisor/reports/:id/review   # Revisar reporte
GET    /api/supervisor/dashboard/stats      # Estadísticas
```

### Brigadista
```
GET    /api/brigadista/reports              # Mis reportes
GET    /api/brigadista/reports/:id          # Ver reporte
PUT    /api/brigadista/reports/:id          # Editar reporte
POST   /api/brigadista/reports/:id/submit   # Enviar para revisión
POST   /api/brigadista/reports/:id/attachments  # Subir archivo
GET    /api/brigadista/dashboard/stats      # Mis estadísticas
```

### Notificaciones
```
GET    /api/notifications                   # Listar notificaciones
GET    /api/notifications/unread-count      # Contador no leídas
PUT    /api/notifications/:id/read          # Marcar como leída
PUT    /api/notifications/mark-all-read     # Marcar todas
DELETE /api/notifications/:id               # Eliminar
```

## Flujo de Trabajo

### 1. Supervisor asigna reporte
```bash
POST /api/supervisor/reports/assign
{
  "brigadistaId": 2,
  "title": "Reporte Mensual - Marzo 2026",
  "description": "Actividades del mes de marzo",
  "dueDate": "2026-03-31",
  "periodStart": "2026-03-01",
  "periodEnd": "2026-03-31"
}
```

### 2. Brigadista elabora reporte
```bash
PUT /api/brigadista/reports/1
{
  "description": "Actividades realizadas...",
  "activities": [
    {
      "date": "2026-03-15",
      "description": "Inspección de área",
      "location": "Sector 5",
      "findings": "Todo en orden"
    }
  ],
  "observations": "Sin novedades"
}
```

### 3. Brigadista envía para revisión
```bash
POST /api/brigadista/reports/1/submit
```

### 4. Supervisor revisa y aprueba/rechaza
```bash
PUT /api/supervisor/reports/1/review
{
  "action": "APPROVE",  // o "REJECT"
  "comments": "Excelente trabajo",
  "observations": []
}
```

## Agentes Automáticos

Los agentes se ejecutan automáticamente:

- **Recordatorios**: Diario a las 8:00 AM
  - Notifica reportes que vencen en 3 días o menos

- **Alertas de Vencimiento**: Diario a las 9:00 AM
  - Notifica reportes vencidos al brigadista y supervisor

En modo desarrollo, se ejecutan cada hora.

## Estados del Reporte

| Estado | Descripción |
|--------|-------------|
| ASIGNADO | Reporte asignado al brigadista |
| EN_ELABORACION | Brigadista trabajando en el reporte |
| ENVIADO | Reporte enviado para revisión |
| EN_REVISION | Supervisor revisando |
| OBSERVADO | Requiere correcciones |
| APROBADO | Reporte aprobado |

## Pruebas con PowerShell

Crear archivo `test-workflow.ps1`:

```powershell
# Login como supervisor
$supervisor = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body (@{
  username = "supervisor1"
  password = "supervisor123"
} | ConvertTo-Json) -ContentType "application/json"

$token = $supervisor.token

# Asignar reporte
$report = Invoke-RestMethod -Uri "http://localhost:4000/api/supervisor/reports/assign" -Method POST -Headers @{
  Authorization = "Bearer $token"
} -Body (@{
  brigadistaId = 2
  title = "Reporte Test"
  description = "Descripción del reporte"
  dueDate = "2026-04-30"
  periodStart = "2026-04-01"
  periodEnd = "2026-04-30"
} | ConvertTo-Json) -ContentType "application/json"

Write-Host "Reporte asignado: $($report.data.id)"
```

## Estructura de Datos

### Reporte (Report)
```javascript
{
  id: 1,
  documentType: "Report",
  assignedTo: 2,
  assignedBy: 1,
  assignedDate: "2026-02-27",
  dueDate: "2026-03-31",
  title: "Reporte Mensual",
  description: "...",
  status: "ASIGNADO",
  workflowHistory: [...],
  auditTrail: [...],
  version: 1
}
```

### Notificación (Notification)
```javascript
{
  id: 1,
  userId: 2,
  type: "REPORT_ASSIGNED",
  title: "Nuevo reporte asignado",
  message: "Se te ha asignado el reporte: ...",
  relatedReportId: 1,
  priority: "MEDIUM",
  read: false
}
```

## Seguridad

- Autenticación JWT
- Contraseñas encriptadas con bcrypt
- Control de acceso por rol
- Validación de permisos en cada endpoint
- Auditoría completa de acciones

## Soporte

Para más información, consulta la propuesta técnica completa en `PROPUESTA_LOTUS_DOMINO_BRIGADISTAS.md`.
