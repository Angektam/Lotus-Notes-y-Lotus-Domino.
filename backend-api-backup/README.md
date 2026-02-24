# Backend API - Node.js + Express

API REST con autenticación JWT y MySQL.

## Instalación

```bash
npm install
```

## Configuración

1. Copia `.env.example` a `.env`
2. Configura las variables de entorno (host, usuario, contraseña de MySQL)
3. Crea la base de datos en MySQL: `CREATE DATABASE backend_api;`

## Uso

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Endpoints

### Autenticación
- POST `/api/auth/register` - Registrar usuario
- POST `/api/auth/login` - Iniciar sesión

### Usuarios (requiere autenticación)
- GET `/api/users` - Listar usuarios
- GET `/api/users/:id` - Obtener usuario
- PUT `/api/users/:id` - Actualizar usuario
- DELETE `/api/users/:id` - Eliminar usuario
