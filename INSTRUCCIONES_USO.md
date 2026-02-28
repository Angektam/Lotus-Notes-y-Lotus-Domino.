# 📋 Instrucciones de Uso - Sistema de Servicio Social

## 🚀 Inicio Rápido

### 1. Iniciar los Servidores

Los servidores ya están corriendo:
- **Backend:** http://localhost:4000
- **Frontend:** http://localhost:3000

### 2. Usuarios de Prueba

#### 👑 Administrador
```
Email: admin@serviciosocial.com
Password: admin123
Rol: Administrador
```

#### 👤 Estudiante
```
Email: estudiante@serviciosocial.com
Password: estudiante123
Rol: Estudiante
```

## 📱 Funcionalidades por Rol

### 🎯 Panel de Estudiante

Cuando inicias sesión como estudiante, tienes acceso a:

1. **Dashboard**
   - Estadísticas de tus informes
   - Horas acumuladas
   - Informes pendientes y aprobados
   - Accesos rápidos

2. **Mis Informes** (Principal)
   - Crear nuevos informes mensuales
   - Editar borradores
   - Ver historial completo
   - Estados: Borrador, Enviado, Aprobado, Rechazado

3. **Estructura del Informe**
   - I. Datos del Estudiante y Dependencia
   - II. Objetivos, Metas y Actividades (tabla dinámica)
   - III. Participantes y Beneficiados
   - IV. Observaciones
   - V. Evidencias (preparado para implementar)

4. **Herramientas Complementarias**
   - Notas para apuntes
   - Tareas pendientes
   - Calendario de entregas
   - Mensajería

### 👑 Panel de Administrador

Cuando inicias sesión como administrador, tienes acceso a:

1. **Dashboard Administrativo**
   - Total de informes en el sistema
   - Total de estudiantes registrados
   - Horas totales acumuladas
   - Informes pendientes de revisión
   - Distribución por estado (gráficas)
   - Informes recientes

2. **Revisar Informes**
   - Ver todos los informes del sistema
   - Filtrar por estado (Pendiente, Aprobado, Rechazado)
   - Buscar por estudiante o proyecto
   - Ver detalles completos de cada informe
   - Aprobar informes
   - Rechazar informes con comentarios
   - Historial de revisiones

3. **Gestión de Estudiantes** (próximamente)
   - Lista de todos los estudiantes
   - Estadísticas por estudiante
   - Historial de informes

4. **Acceso a Funciones de Estudiante**
   - El admin también puede crear sus propios informes
   - Acceso a todas las herramientas complementarias

## 🔄 Flujo de Trabajo

### Para Estudiantes:

1. **Crear Informe**
   - Ir a "Mis Informes"
   - Clic en "+ Nuevo Informe"
   - Llenar todas las secciones
   - Guardar como borrador

2. **Completar Informe**
   - Agregar objetivos (puedes agregar múltiples)
   - Registrar participantes
   - Escribir observaciones
   - Agregar evidencias (próximamente)

3. **Enviar Informe**
   - Revisar toda la información
   - Cambiar estado a "Enviado"
   - Esperar revisión del administrador

4. **Seguimiento**
   - Ver estado en el dashboard
   - Revisar comentarios del administrador
   - Editar si fue rechazado

### Para Administradores:

1. **Revisar Informes Pendientes**
   - Ir a "Revisar Informes"
   - Filtrar por "Pendientes"
   - Ver lista de informes por revisar

2. **Evaluar Informe**
   - Clic en "Ver Detalle"
   - Revisar toda la información
   - Leer objetivos y actividades
   - Verificar horas y participantes

3. **Aprobar o Rechazar**
   - **Aprobar:** Clic en "✓ Aprobar"
   - **Rechazar:** Agregar comentarios obligatorios y clic en "✕ Rechazar"

4. **Seguimiento**
   - Ver estadísticas en el dashboard
   - Monitorear progreso de estudiantes
   - Generar reportes (próximamente)

## 🎨 Características de la Interfaz

### Diseño Profesional
- Colores corporativos
- Tipografía moderna (Segoe UI/Roboto)
- Animaciones suaves
- Responsive (funciona en móviles)
- Sidebar con gradiente
- Cards con sombras y hover effects

### Estados Visuales
- 🟡 **Borrador:** Amarillo/Gris
- 🔵 **Pendiente:** Azul
- 🟢 **Aprobado:** Verde
- 🔴 **Rechazado:** Rojo

### Navegación Intuitiva
- Menú lateral con iconos
- Indicador de página activa
- Breadcrumbs (próximamente)
- Búsqueda y filtros

## 🔐 Seguridad

- Autenticación JWT (tokens de 24 horas)
- Contraseñas encriptadas con bcrypt
- Rutas protegidas por rol
- Validación de permisos en backend
- Variables de entorno protegidas

## 📊 API Endpoints

### Estudiantes
```
GET    /api/reports          - Mis informes
POST   /api/reports          - Crear informe
PUT    /api/reports/:id      - Actualizar informe
DELETE /api/reports/:id      - Eliminar informe
POST   /api/reports/:id/submit - Enviar informe
```

### Administradores
```
GET    /api/admin/statistics      - Estadísticas generales
GET    /api/admin/reports         - Todos los informes
PUT    /api/admin/reports/:id/approve - Aprobar informe
PUT    /api/admin/reports/:id/reject  - Rechazar informe
GET    /api/admin/students        - Lista de estudiantes
```

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
cd lotus-notes-collab
npm install
npm run dev
```

### El frontend no carga
```bash
cd lotus-notes-frontend
npm install
npm run dev
```

### No puedo iniciar sesión
- Verifica que el backend esté corriendo en puerto 4000
- Usa las credenciales de prueba proporcionadas
- Revisa la consola del navegador (F12)

### Los cambios no se reflejan
- El frontend usa Hot Module Replacement (HMR)
- Refresca la página (Ctrl + R)
- Limpia caché (Ctrl + Shift + R)

## 📝 Próximas Funcionalidades

- [ ] Carga de evidencias (fotos y documentos)
- [ ] Generación de PDF automática
- [ ] Firma digital de supervisores
- [ ] Notificaciones en tiempo real
- [ ] Exportación masiva de reportes
- [ ] Dashboard con gráficas avanzadas
- [ ] Aplicación móvil
- [ ] Integración con email

## 💡 Consejos de Uso

1. **Para Estudiantes:**
   - Guarda tus informes como borrador frecuentemente
   - Revisa bien antes de enviar
   - Lee los comentarios del administrador
   - Mantén un registro de tus horas

2. **Para Administradores:**
   - Revisa los informes regularmente
   - Proporciona comentarios constructivos
   - Usa los filtros para organizar
   - Monitorea las estadísticas

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
- Revisa la consola del navegador (F12)
- Verifica los logs del servidor
- Contacta al equipo de desarrollo

---

**Versión:** 2.0.0 - Sistema Completo con Roles  
**Fecha:** 25 de Febrero, 2026  
**Estado:** ✅ Funcional
