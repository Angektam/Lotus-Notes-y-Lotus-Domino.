# 🔐 CREDENCIALES DE ACCESO

## Sistema Lotus Domino - Servicio Social

---

## 🌐 URLs de Acceso

**Frontend:** http://localhost:3000
**Backend API:** http://localhost:4000

---

## 👥 Usuarios Disponibles

### 1. Supervisor
```
Usuario: supervisor1
Password: supervisor123
Rol: Supervisor
```

**Permisos:**
- ✅ Registrar brigadistas
- ✅ Asignar reportes
- ✅ Revisar reportes enviados
- ✅ Aprobar/Rechazar reportes
- ✅ Ver estadísticas generales
- ✅ Gestionar brigadistas

**Acceso al sistema:**
- Puedes usar: `supervisor1` (sin @)
- O email: `supervisor@example.com`

---

### 2. Brigadista 1
```
Usuario: brigadista1
Password: brigadista123
Rol: Brigadista
Zona: Zona Norte
Equipo: Equipo A
```

**Permisos:**
- ✅ Ver reportes asignados
- ✅ Elaborar reportes
- ✅ Editar reportes en borrador
- ✅ Enviar reportes para revisión
- ✅ Subir evidencias (fotos/documentos)
- ✅ Ver observaciones del supervisor
- ✅ Corregir reportes observados

**Acceso al sistema:**
- Puedes usar: `brigadista1` (sin @)
- O email: `brigadista1@example.com`

---

### 3. Brigadista 2
```
Usuario: brigadista2
Password: brigadista123
Rol: Brigadista
Zona: Zona Centro
Equipo: Equipo B
```

**Permisos:**
- ✅ Mismos permisos que Brigadista 1

**Acceso al sistema:**
- Puedes usar: `brigadista2` (sin @)
- O email: `brigadista2@example.com`

---

### 4. Administrador
```
Usuario: admin
Password: admin123
Rol: Admin
```

**Permisos:**
- ✅ Acceso completo al sistema
- ✅ Gestión de todos los usuarios
- ✅ Ver todos los reportes
- ✅ Acceso a todas las funcionalidades

**Acceso al sistema:**
- Puedes usar: `admin` (sin @)
- O email: `admin@example.com`

---

## 📝 Cómo Iniciar Sesión

### Opción 1: Con Username (Recomendado)
```
1. Ir a: http://localhost:3000
2. En el campo "Usuario o Correo Electrónico" escribir: supervisor1
3. En el campo "Contraseña" escribir: supervisor123
4. Click en "Iniciar Sesión"
```

### Opción 2: Con Email
```
1. Ir a: http://localhost:3000
2. En el campo "Usuario o Correo Electrónico" escribir: supervisor@example.com
3. En el campo "Contraseña" escribir: supervisor123
4. Click en "Iniciar Sesión"
```

---

## 🎯 Flujo de Trabajo Recomendado

### Para Probar el Sistema Completo:

**1. Login como Supervisor**
```
Usuario: supervisor1
Password: supervisor123
```
- Asignar un reporte a brigadista1
- Ver dashboard con estadísticas

**2. Cerrar sesión y Login como Brigadista**
```
Usuario: brigadista1
Password: brigadista123
```
- Ver reportes asignados
- Elaborar el reporte
- Enviar para revisión

**3. Volver a Login como Supervisor**
```
Usuario: supervisor1
Password: supervisor123
```
- Ver reportes pendientes de revisión
- Aprobar o rechazar el reporte

---

## 🔧 Solución de Problemas

### Error: "Credenciales inválidas"
✅ **Solución:** Asegúrate de escribir el username exactamente como está:
- `supervisor1` (sin espacios, sin @)
- `brigadista1` (sin espacios, sin @)

### Error: "Token inválido"
✅ **Solución:** 
1. Cierra sesión
2. Borra el localStorage del navegador (F12 > Application > Local Storage > Clear)
3. Vuelve a iniciar sesión

### No aparece el formulario de login
✅ **Solución:**
1. Verifica que el frontend esté corriendo: http://localhost:3000
2. Verifica que el backend esté corriendo: http://localhost:4000
3. Recarga la página (Ctrl + F5)

---

## 📊 Endpoints API (Para Desarrollo)

### Login con PowerShell
```powershell
# Login con username
$response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body (@{
    username = "supervisor1"
    password = "supervisor123"
} | ConvertTo-Json) -ContentType "application/json"

$token = $response.token
Write-Host "Token: $token"
```

### Login con cURL
```bash
# Login con username
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"supervisor1","password":"supervisor123"}'
```

---

## 🎨 Interfaz Actualizada

El formulario de login ahora acepta:
- ✅ Username (sin necesidad de @)
- ✅ Email (con @)
- ✅ Validación automática del tipo de entrada

**Antes:**
```
Campo: "Correo Electrónico" (solo email con @)
```

**Ahora:**
```
Campo: "Usuario o Correo Electrónico" (username o email)
```

---

## 📞 Soporte

Si tienes problemas para iniciar sesión:

1. Verifica que ambos servicios estén corriendo
2. Usa exactamente las credenciales mostradas arriba
3. Prueba primero con username (sin @)
4. Si persiste el error, revisa la consola del navegador (F12)

---

**Última actualización:** 27 de Febrero, 2026
**Versión:** 2.0.0
**Estado:** ✅ CREDENCIALES ACTUALIZADAS
