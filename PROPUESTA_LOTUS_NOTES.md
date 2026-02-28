# PROPUESTA TÉCNICA
## Sistema de Gestión de Informes de Servicio Social

---

## 1. RESUMEN EJECUTIVO

Sistema web para la gestión integral de informes mensuales de servicio social, permitiendo a estudiantes registrar actividades, objetivos, metas, participantes y evidencias de manera estructurada y profesional.

---

## 2. FUNCIONALIDADES PRINCIPALES

### Módulo de Informes (Principal)
- **Creación de informes mensuales** con estructura oficial
- **Datos del estudiante y dependencia**: Registro completo de información académica
- **Objetivos, metas y actividades**: Tablas dinámicas para múltiples entradas
- **Participantes y beneficiados**: Seguimiento de impacto social
- **Observaciones**: Resultados, dificultades y aprendizajes
- **Evidencias**: Carga de fotografías y documentos
- **Estados**: Borrador, Enviado, Aprobado, Rechazado
- **Historial completo**: Visualización de todos los informes

### Funcionalidades Complementarias
- **Autenticación**: Registro, login con JWT, gestión de roles
- **Notas**: Apuntes y recordatorios del servicio social
- **Tareas**: Seguimiento de actividades pendientes
- **Calendario**: Programación de eventos y entregas
- **Mensajería**: Comunicación con supervisores

---

## 3. TECNOLOGÍAS

**Backend:**
- Node.js + Express.js
- MySQL + Sequelize ORM
- JWT Authentication
- Bcrypt encryption

**Frontend:**
- React 18 + Vite
- React Router
- Axios
- Diseño corporativo responsive

---

## 4. ARQUITECTURA

```
Backend (Puerto 4000)          Frontend (Puerto 3000)
├── API REST                   ├── SPA React
├── Autenticación JWT          ├── Rutas protegidas
├── 6 Módulos principales      ├── 6 Páginas principales
│   ├── Auth                   │   ├── Login/Registro
│   ├── Informes SS (★)        │   ├── Dashboard (Estadísticas)
│   ├── Notas                  │   ├── Informes SS (Principal)
│   ├── Tareas                 │   ├── Notas
│   ├── Calendario             │   ├── Tareas
│   └── Mensajes               │   └── Calendario
└── Base de datos MySQL        └── Interfaz profesional
```

---

## 5. INSTALACIÓN

**Backend:**
```bash
cd lotus-notes-collab
npm install
# Configurar .env con credenciales MySQL
# Crear base de datos: CREATE DATABASE lotus_notes_db;
npm run dev
```

**Frontend:**
```bash
cd lotus-notes-frontend
npm install
npm run dev
```

---

## 6. MÓDULO DE INFORMES DE SERVICIO SOCIAL

### 6.1 Estructura del Informe Mensual

**I. Datos del Estudiante y Dependencia:**
- Nombre completo del estudiante
- Unidad académica y carrera
- Número de cuenta
- Nombre de la dependencia receptora
- Nombre del proyecto
- Periodo de prestación (fecha inicio - fecha fin)
- Total de horas realizadas

**II. Objetivos, Metas y Actividades:**
- Tabla con tres columnas:
  - Objetivo específico
  - Metas cuantificables
  - Actividades realizadas
- Permite agregar múltiples filas según sea necesario

**III. Participantes y/o Beneficiados:**
- Tabla de actividades con:
  - Descripción de la actividad
  - Número de participantes/beneficiados
- Registro detallado de impacto social

**IV. Observaciones:**
- Campo de texto libre para comentarios
- Resultados obtenidos
- Dificultades encontradas
- Aprendizajes adquiridos

**V. Evidencias de Trabajo:**
- Carga de fotografías (formato JPG, PNG)
- Documentos de respaldo (PDF, DOCX)
- Máximo 10 archivos por informe
- Tamaño máximo: 5MB por archivo

### 6.2 Funcionalidades del Sistema

- Creación de informes mensuales con formulario guiado
- Guardado automático de borradores
- Validación de campos obligatorios
- Generación automática de PDF con formato institucional
- Historial completo de informes enviados
- Edición de informes antes de la fecha límite
- Notificaciones de recordatorio de entrega

---

## 7. ENDPOINTS PRINCIPALES

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET/POST/PUT/DELETE /api/notes` - Notas
- `GET/POST/PUT/DELETE /api/tasks` - Tareas
- `GET/POST/PUT/DELETE /api/calendar` - Eventos
- `GET/POST /api/messages` - Mensajes
- **Informes de Servicio Social:**
  - `POST /api/reports` - Crear informe mensual
  - `GET /api/reports` - Listar informes del usuario
  - `GET /api/reports/:id` - Obtener informe específico
  - `PUT /api/reports/:id` - Actualizar informe
  - `DELETE /api/reports/:id` - Eliminar informe
  - `POST /api/reports/:id/evidence` - Subir evidencias (fotos/documentos)
  - `GET /api/reports/:id/pdf` - Generar PDF del informe

---

## 8. SEGURIDAD

- Autenticación JWT (tokens 24h)
- Contraseñas encriptadas (bcrypt)
- Validación de inputs
- CORS configurado
- Variables de entorno protegidas
- Validación de tipos de archivo en evidencias
- Límite de tamaño de archivos (5MB)
- Sanitización de datos en informes

---

## 9. COSTOS ESTIMADOS

**Producción mensual:**
- VPS (2GB RAM): $10-20
- MySQL Database: $5-15
- Almacenamiento adicional (evidencias): $3-5
- Dominio: $1-2
- SSL: Gratis (Let's Encrypt)
- **Total: $19-42 USD/mes**

---

## 10. MEJORAS FUTURAS

- Notificaciones en tiempo real
- Aplicación móvil
- Integración con email
- Dashboard de analíticas
- **Módulo de Informes:**
  - Firma digital de supervisores
  - Validación automática de horas
  - Recordatorios de entrega mensual
  - Historial completo de informes
  - Exportación masiva de reportes
  - Estadísticas de avance del servicio social

---

## 11. VENTAJAS

✓ Enfoque especializado en servicio social
✓ Estructura de informes conforme a requisitos oficiales
✓ Interfaz intuitiva y profesional
✓ Seguimiento completo de actividades y horas
✓ Gestión de evidencias fotográficas y documentos
✓ Arquitectura escalable y segura
✓ Bajo costo de implementación
✓ Código mantenible y documentado

---

**Fecha:** 25 de Febrero, 2026
**Versión:** 2.0.0 - Enfoque Servicio Social
**Estado:** Implementado y Funcional
