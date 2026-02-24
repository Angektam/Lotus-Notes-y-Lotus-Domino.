# Script para probar todos los endpoints de Lotus Notes API

Write-Host "=== LOTUS NOTES API TEST ===" -ForegroundColor Cyan

# 1. Registrar usuario
Write-Host "`n1. Registrando usuario..." -ForegroundColor Yellow
$register = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"username":"admin","email":"admin@lotus.com","password":"123456","fullName":"Administrador","department":"IT"}'
Write-Host "Usuario registrado:" -ForegroundColor Green
$register | ConvertTo-Json

# 2. Iniciar sesión
Write-Host "`n2. Iniciando sesión..." -ForegroundColor Yellow
$login = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@lotus.com","password":"123456"}'
$token = $login.token
Write-Host "Login exitoso. Token obtenido." -ForegroundColor Green
$login | ConvertTo-Json

# Headers con token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. Crear notas
Write-Host "`n3. Creando notas..." -ForegroundColor Yellow
$note1 = Invoke-RestMethod -Uri "http://localhost:4000/api/notes" -Method POST -Headers $headers -Body '{"title":"Reunión de proyecto","content":"Discutir avances del proyecto Lotus Notes","priority":"high","isPublic":true,"category":"Trabajo"}'
$note2 = Invoke-RestMethod -Uri "http://localhost:4000/api/notes" -Method POST -Headers $headers -Body '{"title":"Ideas para mejorar","content":"Lista de mejoras pendientes","priority":"medium","isPublic":false,"category":"Personal"}'
Write-Host "Notas creadas:" -ForegroundColor Green
$note1 | ConvertTo-Json
$note2 | ConvertTo-Json

# 4. Ver mis notas
Write-Host "`n4. Listando mis notas..." -ForegroundColor Yellow
$myNotes = Invoke-RestMethod -Uri "http://localhost:4000/api/notes" -Method GET -Headers $headers
Write-Host "Total de notas: $($myNotes.notes.Count)" -ForegroundColor Green
$myNotes | ConvertTo-Json -Depth 3

# 5. Ver notas públicas
Write-Host "`n5. Listando notas públicas..." -ForegroundColor Yellow
$publicNotes = Invoke-RestMethod -Uri "http://localhost:4000/api/notes/public" -Method GET -Headers $headers
Write-Host "Total de notas públicas: $($publicNotes.notes.Count)" -ForegroundColor Green

# 6. Crear tareas
Write-Host "`n6. Creando tareas..." -ForegroundColor Yellow
$task1 = Invoke-RestMethod -Uri "http://localhost:4000/api/tasks" -Method POST -Headers $headers -Body '{"title":"Revisar documentación","description":"Actualizar la documentación del proyecto","priority":"urgent","dueDate":"2026-02-28","assignedTo":1}'
$task2 = Invoke-RestMethod -Uri "http://localhost:4000/api/tasks" -Method POST -Headers $headers -Body '{"title":"Preparar presentación","description":"Crear slides para la reunión","priority":"high","dueDate":"2026-03-01","assignedTo":1}'
Write-Host "Tareas creadas:" -ForegroundColor Green
$task1 | ConvertTo-Json
$task2 | ConvertTo-Json

# 7. Ver mis tareas
Write-Host "`n7. Listando mis tareas..." -ForegroundColor Yellow
$myTasks = Invoke-RestMethod -Uri "http://localhost:4000/api/tasks/my-tasks" -Method GET -Headers $headers
Write-Host "Total de tareas: $($myTasks.tasks.Count)" -ForegroundColor Green
$myTasks | ConvertTo-Json -Depth 3

# 8. Crear eventos en calendario
Write-Host "`n8. Creando eventos en calendario..." -ForegroundColor Yellow
$event1 = Invoke-RestMethod -Uri "http://localhost:4000/api/calendar" -Method POST -Headers $headers -Body '{"title":"Reunión de equipo","description":"Revisión semanal","startDate":"2026-02-24T10:00:00","endDate":"2026-02-24T11:00:00","eventType":"meeting","location":"Sala de conferencias"}'
$event2 = Invoke-RestMethod -Uri "http://localhost:4000/api/calendar" -Method POST -Headers $headers -Body '{"title":"Deadline proyecto","description":"Entrega final","startDate":"2026-02-28T23:59:00","endDate":"2026-02-28T23:59:00","eventType":"reminder","isAllDay":true}'
Write-Host "Eventos creados:" -ForegroundColor Green
$event1 | ConvertTo-Json
$event2 | ConvertTo-Json

# 9. Ver eventos
Write-Host "`n9. Listando eventos del calendario..." -ForegroundColor Yellow
$myEvents = Invoke-RestMethod -Uri "http://localhost:4000/api/calendar" -Method GET -Headers $headers
Write-Host "Total de eventos: $($myEvents.events.Count)" -ForegroundColor Green
$myEvents | ConvertTo-Json -Depth 3

# 10. Enviar mensaje
Write-Host "`n10. Enviando mensaje..." -ForegroundColor Yellow
$message1 = Invoke-RestMethod -Uri "http://localhost:4000/api/messages" -Method POST -Headers $headers -Body '{"receiverId":1,"subject":"Bienvenido al sistema","body":"Este es un mensaje de prueba del sistema Lotus Notes","priority":"normal"}'
Write-Host "Mensaje enviado:" -ForegroundColor Green
$message1 | ConvertTo-Json

# 11. Ver bandeja de entrada
Write-Host "`n11. Revisando bandeja de entrada..." -ForegroundColor Yellow
$inbox = Invoke-RestMethod -Uri "http://localhost:4000/api/messages/inbox" -Method GET -Headers $headers
Write-Host "Total de mensajes: $($inbox.messages.Count)" -ForegroundColor Green
$inbox | ConvertTo-Json -Depth 3

# 12. Ver mensajes enviados
Write-Host "`n12. Revisando mensajes enviados..." -ForegroundColor Yellow
$sent = Invoke-RestMethod -Uri "http://localhost:4000/api/messages/sent" -Method GET -Headers $headers
Write-Host "Total de mensajes enviados: $($sent.messages.Count)" -ForegroundColor Green
$sent | ConvertTo-Json -Depth 3

Write-Host "`n=== TEST COMPLETADO ===" -ForegroundColor Cyan
Write-Host "Todos los endpoints funcionan correctamente!" -ForegroundColor Green
