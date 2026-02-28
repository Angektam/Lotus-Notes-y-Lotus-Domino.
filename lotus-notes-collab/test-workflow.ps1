# Script de prueba del workflow Supervisor-Brigadista
# Sistema Lotus Domino

$baseUrl = "http://localhost:4000/api"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Workflow Lotus Domino" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Login como Supervisor
Write-Host "1. Login como Supervisor..." -ForegroundColor Yellow
$supervisorLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
    username = "supervisor1"
    password = "supervisor123"
} | ConvertTo-Json) -ContentType "application/json"

$supervisorToken = $supervisorLogin.token
Write-Host "   ✓ Token obtenido" -ForegroundColor Green
Write-Host ""

# 2. Obtener lista de brigadistas
Write-Host "2. Obteniendo brigadistas..." -ForegroundColor Yellow
$brigadistas = Invoke-RestMethod -Uri "$baseUrl/supervisor/brigadistas" -Method GET -Headers @{
    Authorization = "Bearer $supervisorToken"
}

Write-Host "   ✓ Brigadistas encontrados: $($brigadistas.data.Count)" -ForegroundColor Green
foreach ($b in $brigadistas.data) {
    Write-Host "     - $($b.fullName) (ID: $($b.id))" -ForegroundColor Gray
}
Write-Host ""

# 3. Asignar reporte a brigadista
Write-Host "3. Asignando reporte a brigadista..." -ForegroundColor Yellow
$brigadistaId = $brigadistas.data[0].id
$dueDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")

$report = Invoke-RestMethod -Uri "$baseUrl/supervisor/reports/assign" -Method POST -Headers @{
    Authorization = "Bearer $supervisorToken"
} -Body (@{
    brigadistaId = $brigadistaId
    title = "Reporte de Prueba - $(Get-Date -Format 'dd/MM/yyyy')"
    description = "Este es un reporte de prueba del sistema Lotus Domino"
    dueDate = $dueDate
    periodStart = (Get-Date).ToString("yyyy-MM-dd")
    periodEnd = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
} | ConvertTo-Json) -ContentType "application/json"

$reportId = $report.data.id
Write-Host "   ✓ Reporte asignado con ID: $reportId" -ForegroundColor Green
Write-Host "   Estado: $($report.data.status)" -ForegroundColor Gray
Write-Host ""

# 4. Login como Brigadista
Write-Host "4. Login como Brigadista..." -ForegroundColor Yellow
$brigadistaLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
    username = "brigadista1"
    password = "brigadista123"
} | ConvertTo-Json) -ContentType "application/json"

$brigadistaToken = $brigadistaLogin.token
Write-Host "   ✓ Token obtenido" -ForegroundColor Green
Write-Host ""

# 5. Ver reportes asignados
Write-Host "5. Consultando reportes asignados..." -ForegroundColor Yellow
$myReports = Invoke-RestMethod -Uri "$baseUrl/brigadista/reports" -Method GET -Headers @{
    Authorization = "Bearer $brigadistaToken"
}

Write-Host "   ✓ Reportes asignados: $($myReports.data.Count)" -ForegroundColor Green
Write-Host ""

# 6. Actualizar reporte (elaborar)
Write-Host "6. Elaborando reporte..." -ForegroundColor Yellow
$updateReport = Invoke-RestMethod -Uri "$baseUrl/brigadista/reports/$reportId" -Method PUT -Headers @{
    Authorization = "Bearer $brigadistaToken"
} -Body (@{
    description = "Reporte elaborado con actividades del periodo"
    activities = @(
        @{
            date = (Get-Date).ToString("yyyy-MM-dd")
            description = "Inspección de área asignada"
            location = "Zona Norte - Sector 5"
            findings = "Área en condiciones óptimas"
        },
        @{
            date = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
            description = "Revisión de equipos"
            location = "Zona Norte - Sector 3"
            findings = "Equipos funcionando correctamente"
        }
    )
    observations = "Todas las actividades se realizaron sin contratiempos"
} | ConvertTo-Json -Depth 10) -ContentType "application/json"

Write-Host "   ✓ Reporte actualizado" -ForegroundColor Green
Write-Host "   Estado: $($updateReport.data.status)" -ForegroundColor Gray
Write-Host ""

# 7. Enviar reporte para revisión
Write-Host "7. Enviando reporte para revisión..." -ForegroundColor Yellow
$submitReport = Invoke-RestMethod -Uri "$baseUrl/brigadista/reports/$reportId/submit" -Method POST -Headers @{
    Authorization = "Bearer $brigadistaToken"
}

Write-Host "   ✓ Reporte enviado" -ForegroundColor Green
Write-Host "   Estado: $($submitReport.data.status)" -ForegroundColor Gray
Write-Host ""

# 8. Supervisor revisa reportes pendientes
Write-Host "8. Supervisor consultando reportes pendientes..." -ForegroundColor Yellow
$pendingReports = Invoke-RestMethod -Uri "$baseUrl/supervisor/reports/pending" -Method GET -Headers @{
    Authorization = "Bearer $supervisorToken"
}

Write-Host "   ✓ Reportes pendientes: $($pendingReports.data.Count)" -ForegroundColor Green
Write-Host ""

# 9. Supervisor aprueba reporte
Write-Host "9. Supervisor aprobando reporte..." -ForegroundColor Yellow
$reviewReport = Invoke-RestMethod -Uri "$baseUrl/supervisor/reports/$reportId/review" -Method PUT -Headers @{
    Authorization = "Bearer $supervisorToken"
} -Body (@{
    action = "APPROVE"
    comments = "Excelente trabajo. Reporte completo y detallado."
    observations = @()
} | ConvertTo-Json) -ContentType "application/json"

Write-Host "   ✓ Reporte aprobado" -ForegroundColor Green
Write-Host "   Estado: $($reviewReport.data.status)" -ForegroundColor Gray
Write-Host ""

# 10. Verificar notificaciones del brigadista
Write-Host "10. Consultando notificaciones del brigadista..." -ForegroundColor Yellow
$notifications = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method GET -Headers @{
    Authorization = "Bearer $brigadistaToken"
}

Write-Host "   ✓ Notificaciones: $($notifications.data.Count)" -ForegroundColor Green
foreach ($notif in $notifications.data | Select-Object -First 3) {
    Write-Host "     - $($notif.title): $($notif.message)" -ForegroundColor Gray
}
Write-Host ""

# 11. Estadísticas del supervisor
Write-Host "11. Consultando estadísticas del supervisor..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$baseUrl/supervisor/dashboard/stats" -Method GET -Headers @{
    Authorization = "Bearer $supervisorToken"
}

Write-Host "   ✓ Estadísticas:" -ForegroundColor Green
Write-Host "     Total reportes: $($stats.data.totalReports)" -ForegroundColor Gray
Write-Host "     Pendientes revisión: $($stats.data.pendingReview)" -ForegroundColor Gray
Write-Host "     Aprobados: $($stats.data.approved)" -ForegroundColor Gray
Write-Host "     Vencidos: $($stats.data.overdue)" -ForegroundColor Gray
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Test completado exitosamente!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
