# Guía Rápida - Sistema Lotus Domino

## Inicio Rápido (5 minutos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar base de datos
```sql
CREATE DATABASE lotus_domino_db;
```

### 3. Configurar .env
```bash
cp .env.example .env
# Editar .env con tus credenciales de MySQL
```

### 4. Iniciar servidor
```bash
npm run dev
```

### 5. Crear usuarios de prueba
```bash
node create-users.js
```

### 6. Probar el sistema
```bash
# En PowerShell
.\test-workflow.ps1
```

## Usuarios de Prueba

| Usuario | Password | Rol |
|---------|----------|-----|
| supervisor1 | supervisor123 | Supervisor |
| brigadista1 | brigadista123 | Brigadista |
| brigadista2 | brigadista123 | Brigadista |
| admin | admin123 | Admin |

## Flujo Básico

### Como Supervisor:

1. **Login**
```bash
POST /api/auth/login
{
  "username": "supervisor1",
  "password": "supervisor123"
}
```

2. **Asignar reporte**
```bash
POST /api/supervisor/reports/assign
{
  "brigadistaId": 2,
  "title": "Reporte Marzo 2026",
  "description": "Actividades del mes",
  "dueDate": "2026-03-31",
  "periodStart": "2026-03-01",
  "periodEnd": "2026-03-31"
}
```

3. **Ver reportes pendientes**
```bash
GET /api/supervisor/reports/pending
```

4. **Aprobar reporte**
```bash
PUT /api/supervisor/reports/1/review
{
  "action": "APPROVE",
  "comments": "Excelente trabajo"
}
```

### Como Brigadista:

1. **Login**
```bash
POST /api/auth/login
{
  "username": "brigadista1",
  "password": "brigadista123"
}
```

2. **Ver mis reportes**
```bash
GET /api/brigadista/reports
```

3. **Elaborar reporte**
```bash
PUT /api/brigadista/reports/1
{
  "description": "Actividades realizadas...",
  "activities": [
    {
      "date": "2026-03-15",
      "description": "Inspección",
      "location": "Sector 5",
      "findings": "Todo en orden"
    }
  ]
}
```

4. **Enviar para revisión**
```bash
POST /api/brigadista/reports/1/submit
```

## Características Principales

✅ **Workflow Automatizado**
- Estados controlados
- Transiciones validadas
- Historial completo

✅ **Notificaciones**
- Reporte asignado
- Reporte enviado
- Reporte aprobado/rechazado
- Recordatorios automáticos

✅ **Agentes Automáticos**
- Recordatorios (3 días antes)
- Alertas de vencimiento
- Ejecutan automáticamente

✅ **Seguridad**
- JWT authentication
- Control de acceso por rol
- Auditoría completa

## Endpoints Principales

### Supervisor
- `POST /api/supervisor/brigadistas` - Registrar brigadista
- `GET /api/supervisor/brigadistas` - Listar brigadistas
- `POST /api/supervisor/reports/assign` - Asignar reporte
- `GET /api/supervisor/reports/pending` - Reportes pendientes
- `PUT /api/supervisor/reports/:id/review` - Revisar reporte
- `GET /api/supervisor/dashboard/stats` - Estadísticas

### Brigadista
- `GET /api/brigadista/reports` - Mis reportes
- `GET /api/brigadista/reports/:id` - Ver reporte
- `PUT /api/brigadista/reports/:id` - Editar reporte
- `POST /api/brigadista/reports/:id/submit` - Enviar
- `POST /api/brigadista/reports/:id/attachments` - Subir archivo
- `GET /api/brigadista/dashboard/stats` - Mis estadísticas

### Notificaciones
- `GET /api/notifications` - Listar
- `GET /api/notifications/unread-count` - Contador
- `PUT /api/notifications/:id/read` - Marcar leída
- `PUT /api/notifications/mark-all-read` - Marcar todas

## Solución de Problemas

### Error de conexión a BD
```bash
# Verificar que MySQL esté corriendo
# Verificar credenciales en .env
# Verificar que la base de datos exista
```

### Error al subir archivos
```bash
# Crear carpeta uploads
mkdir uploads
```

### Agentes no se ejecutan
```bash
# Verificar que NODE_ENV esté configurado
# En desarrollo se ejecutan cada hora
# En producción a las 8:00 y 9:00 AM
```

## Próximos Pasos

1. Personalizar campos del reporte según necesidades
2. Configurar email para notificaciones
3. Implementar frontend React
4. Agregar más agentes automáticos
5. Implementar reportes en PDF

## Soporte

- Documentación completa: `README_LOTUS_DOMINO.md`
- Propuesta técnica: `PROPUESTA_LOTUS_DOMINO_BRIGADISTAS.md`
- Script de prueba: `test-workflow.ps1`
