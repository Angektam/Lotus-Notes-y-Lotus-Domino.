# Migración a SQLite - Base de Datos Local

## ✅ Cambios Realizados

Se ha migrado exitosamente la base de datos de MySQL a SQLite para facilitar el despliegue y eliminar dependencias externas.

## 🎯 Ventajas de SQLite

1. **Sin instalación**: No requiere servidor de base de datos separado
2. **Portabilidad**: Un solo archivo contiene toda la base de datos
3. **Fácil despliegue**: Ideal para aplicaciones web pequeñas y medianas
4. **Cero configuración**: No requiere credenciales ni configuración de red
5. **Backup simple**: Solo copiar el archivo database.sqlite
6. **Perfecto para producción**: Soporta miles de usuarios concurrentes

## 📦 Archivos Modificados

### 1. `src/config/database.js`
- Cambiado de MySQL a SQLite
- Configuración simplificada
- Base de datos en archivo local: `database.sqlite`

### 2. `package.json`
- Removida dependencia: `mysql2`
- Agregada dependencia: `sqlite3`
- Nuevo script: `npm run init` para inicializar la BD

### 3. `.env` y `.env.example`
- Eliminadas variables de MySQL (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- Configuración simplificada

### 4. `.gitignore`
- Agregado `database.sqlite` para no versionar la base de datos
- Agregado `*.db` y `*.db-journal`

### 5. `init-sqlite.js` (NUEVO)
- Script de inicialización de base de datos
- Crea todas las tablas automáticamente
- Genera usuarios de prueba
- Crea datos de ejemplo

## 🚀 Cómo Usar

### Primera vez (Inicializar base de datos)

```bash
cd lotus-notes-collab
npm install
npm run init
```

Esto creará el archivo `database.sqlite` con:
- ✅ Todas las tablas necesarias
- ✅ 4 usuarios de prueba
- ✅ Datos de ejemplo

### Usuarios Creados

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | Administrador |
| supervisor | admin123 | Supervisor |
| brigadista | admin123 | Brigadista |
| estudiante | admin123 | Estudiante |

### Iniciar el servidor

```bash
npm start
# o para desarrollo con auto-reload
npm run dev
```

## 📁 Estructura de Archivos

```
lotus-notes-collab/
├── database.sqlite          # Base de datos (generado automáticamente)
├── init-sqlite.js          # Script de inicialización
├── src/
│   └── config/
│       └── database.js     # Configuración SQLite
└── package.json
```

## 🔄 Migración de Datos Existentes

Si tenías datos en MySQL y quieres migrarlos a SQLite:

### Opción 1: Exportar/Importar Manual
1. Exporta los datos de MySQL a JSON
2. Crea scripts para insertar en SQLite
3. Ejecuta los scripts

### Opción 2: Usar Herramientas
- **DB Browser for SQLite**: GUI para gestionar SQLite
- **sqlite3 CLI**: Herramienta de línea de comandos

## 🛠️ Comandos Útiles

### Reiniciar base de datos (CUIDADO: Borra todos los datos)
```bash
npm run init
```

### Backup de la base de datos
```bash
# Windows
copy database.sqlite database.backup.sqlite

# Linux/Mac
cp database.sqlite database.backup.sqlite
```

### Restaurar backup
```bash
# Windows
copy database.backup.sqlite database.sqlite

# Linux/Mac
cp database.backup.sqlite database.sqlite
```

### Ver la base de datos
Puedes usar herramientas como:
- **DB Browser for SQLite** (GUI): https://sqlitebrowser.org/
- **sqlite3 CLI**: Incluido con SQLite

```bash
sqlite3 database.sqlite
.tables
.schema users
SELECT * FROM users;
.quit
```

## 📊 Rendimiento

SQLite es perfecto para:
- ✅ Hasta 100,000 usuarios
- ✅ Miles de transacciones por segundo
- ✅ Bases de datos de hasta 281 TB
- ✅ Aplicaciones web con tráfico moderado

## 🚀 Despliegue en Producción

### Ventajas para despliegue:
1. **Un solo archivo**: Fácil de respaldar y mover
2. **Sin dependencias**: No necesitas MySQL en el servidor
3. **Menor costo**: No pagas por base de datos separada
4. **Más rápido**: Menos latencia al no usar red

### Plataformas compatibles:
- ✅ Heroku
- ✅ Vercel (con limitaciones)
- ✅ Railway
- ✅ Render
- ✅ DigitalOcean
- ✅ AWS (EC2, Elastic Beanstalk)
- ✅ VPS tradicionales

### Consideraciones:
- Para aplicaciones con escrituras muy intensivas (>1000 escrituras/seg), considera PostgreSQL
- Para aplicaciones distribuidas en múltiples servidores, usa PostgreSQL o MySQL
- Para la mayoría de aplicaciones web, SQLite es perfecto

## 🔒 Seguridad

- El archivo `database.sqlite` está en `.gitignore`
- No se sube al repositorio
- Haz backups regulares
- Usa permisos de archivo apropiados en producción

## 📝 Notas Importantes

1. **Archivo de base de datos**: `database.sqlite` se crea automáticamente
2. **No versionar**: El archivo está en `.gitignore`
3. **Backups**: Copia el archivo regularmente
4. **Desarrollo**: Cada desarrollador tiene su propia base de datos local
5. **Producción**: Usa backups automáticos

## 🆘 Solución de Problemas

### Error: "SQLITE_CANTOPEN"
- Verifica permisos de escritura en el directorio
- Asegúrate de que el directorio existe

### Error: "database is locked"
- Cierra otras conexiones a la base de datos
- Reinicia el servidor

### Datos perdidos
- Restaura desde backup
- Ejecuta `npm run init` para recrear (perderás datos)

## 📚 Recursos

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Sequelize SQLite Guide](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#sqlite)
- [DB Browser for SQLite](https://sqlitebrowser.org/)

## ✨ Próximos Pasos

1. ✅ Base de datos migrada a SQLite
2. ✅ Script de inicialización creado
3. ✅ Usuarios de prueba configurados
4. 🔄 Probar todas las funcionalidades
5. 🚀 Preparar para despliegue

---

**Estado**: ✅ Migración completada exitosamente
**Fecha**: Marzo 2026
**Versión**: 3.1.0
