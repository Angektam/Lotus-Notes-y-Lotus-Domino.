# 🚀 SERVICIOS ACTIVOS

## Estado del Sistema

### ✅ Backend (Lotus Domino API)
```
URL: http://localhost:4000
Estado: ✓ CORRIENDO
Base de Datos: ✓ CONECTADA (lotus_domino_db)
Agentes: ✓ ACTIVOS
```

**Endpoints disponibles:**
- API REST: http://localhost:4000/api
- Documentación: http://localhost:4000

### ✅ Frontend (React + Vite)
```
URL: http://localhost:3000
Estado: ✓ CORRIENDO
Framework: React 18 + Vite
```

**Acceso:**
- Aplicación: http://localhost:3000
- Login: http://localhost:3000/login

---

## 👥 Usuarios Disponibles

### Supervisor
```
Usuario: supervisor1
Password: supervisor123
Rol: Supervisor
```
**Puede:**
- Registrar brigadistas
- Asignar reportes
- Revisar y aprobar/rechazar reportes
- Ver estadísticas

### Brigadista 1
```
Usuario: brigadista1
Password: brigadista123
Rol: Brigadista
Zona: Zona Norte
Equipo: Equipo A
```
**Puede:**
- Ver reportes asignados
- Elaborar reportes
- Enviar para revisión
- Subir evidencias

### Brigadista 2
```
Usuario: brigadista2
Password: brigadista123
Rol: Brigadista
Zona: Zona Centro
Equipo: Equipo B
```

### Admin
```
Usuario: admin
Password: admin123
Rol: Admin
```
**Puede:**
- Acceso completo al sistema
- Gestión de usuarios
- Ver todos los reportes

---

## 🔗 URLs Importantes

### Frontend
- **Inicio**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **Reportes**: http://localhost:3000/reports
- **Notas**: http://localhost:3000/notes
- **Tareas**: http://localhost:3000/tasks
- **Calendario**: http://localhost:3000/calendar
- **Mensajes**: http://localhost:3000/messages

### Backend API
- **Base**: http://localhost:4000/api
- **Auth**: http://localhost:4000/api/auth/login
- **Supervisor**: http://localhost:4000/api/supervisor
- **Brigadista**: http://localhost:4000/api/brigadista
- **Notificaciones**: http://localhost:4000/api/notifications

---

## 🧪 Probar el Sistema

### 1. Acceder al Frontend
```
Abrir navegador: http://localhost:3000
```

### 2. Login como Supervisor
```
Usuario: supervisor1
Password: supervisor123
```

### 3. Login como Brigadista
```
Usuario: brigadista1
Password: brigadista123
```

### 4. Probar API directamente
```powershell
# Login
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body (@{
    username = "supervisor1"
    password = "supervisor123"
} | ConvertTo-Json) -ContentType "application/json"
```

---

## 📊 Funcionalidades Disponibles

### En el Frontend Actual
- ✅ Login/Registro
- ✅ Dashboard con estadísticas
- ✅ Gestión de reportes (servicio social)
- ✅ Notas personales
- ✅ Tareas
- ✅ Calendario de eventos
- ✅ Mensajería

### Nuevas Funcionalidades Backend (Lotus Domino)
- ✅ Workflow Supervisor-Brigadista
- ✅ Asignación de reportes
- ✅ Revisión y aprobación
- ✅ Notificaciones automáticas
- ✅ Agentes programados
- ✅ Carga de archivos

---

## 🔄 Workflow Disponible

```
1. Supervisor asigna reporte → Brigadista recibe notificación
2. Brigadista elabora reporte → Estado: EN_ELABORACION
3. Brigadista envía → Estado: ENVIADO
4. Supervisor revisa → Estado: EN_REVISION
5. Supervisor decide:
   - Aprobar → Estado: APROBADO ✓
   - Rechazar → Estado: OBSERVADO → Vuelve al paso 2
```

---

## 🛠️ Comandos Útiles

### Ver procesos activos
```powershell
# En PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### Detener servicios
```powershell
# Detener backend
# Ir a la terminal donde corre y presionar Ctrl+C

# Detener frontend
# Ir a la terminal donde corre y presionar Ctrl+C
```

### Reiniciar servicios
```bash
# Backend
cd lotus-notes-collab
npm run dev

# Frontend
cd lotus-notes-frontend
npm run dev
```

---

## 📝 Próximos Pasos

### Para integrar el nuevo workflow en el frontend:

1. **Crear páginas para Supervisor:**
   - Dashboard de supervisor
   - Lista de brigadistas
   - Asignar reportes
   - Revisar reportes pendientes

2. **Crear páginas para Brigadista:**
   - Dashboard de brigadista
   - Mis reportes asignados
   - Elaborar/editar reporte
   - Ver observaciones

3. **Agregar componentes:**
   - Notificaciones en tiempo real
   - Indicadores de estado
   - Formulario de reporte
   - Carga de archivos

4. **Actualizar rutas:**
   - `/supervisor/dashboard`
   - `/supervisor/brigadistas`
   - `/supervisor/reportes`
   - `/brigadista/dashboard`
   - `/brigadista/reportes`

---

## 🎯 Estado Actual

**Backend:** ✅ Completamente funcional
- API REST completa
- Workflow implementado
- Notificaciones activas
- Agentes programados

**Frontend:** ⚠️ Funcional (sistema anterior)
- Necesita integración con nuevo workflow
- Páginas actuales funcionan
- Requiere nuevas páginas para Supervisor/Brigadista

---

## 📞 Información de Contacto

**Documentación:**
- Backend: `lotus-notes-collab/README_LOTUS_DOMINO.md`
- Guía rápida: `lotus-notes-collab/GUIA_RAPIDA.md`
- Estado: `lotus-notes-collab/SISTEMA_FUNCIONANDO.md`

**Scripts de prueba:**
- Test workflow: `lotus-notes-collab/test-simple.ps1`
- Crear usuarios: `lotus-notes-collab/create-users.js`

---

**Fecha:** 27 de Febrero, 2026
**Versión:** 2.0.0
**Estado:** ✅ SERVICIOS ACTIVOS Y FUNCIONANDO
