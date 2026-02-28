# Test simple del workflow
$baseUrl = "http://localhost:4000/api"

Write-Host "Test Workflow Lotus Domino" -ForegroundColor Cyan
Write-Host ""

# 1. Login Supervisor
Write-Host "1. Login Supervisor..." -ForegroundColor Yellow
$supervisor = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
    username = "supervisor1"
    password = "supervisor123"
} | ConvertTo-Json) -ContentType "application/json"

Write-Host "   Token obtenido" -ForegroundColor Green
Write-Host ""

# 2. Listar brigadistas
Write-Host "2. Listar brigadistas..." -ForegroundColor Yellow
$brigadistas = Invoke-RestMethod -Uri "$baseUrl/supervisor/brigadistas" -Method GET -Headers @{
    Authorization = "Bearer $($supervisor.token)"
}

Write-Host "   Brigadistas: $($brigadistas.data.Count)" -ForegroundColor Green
Write-Host ""

# 3. Asignar reporte
Write-Host "3. Asignar reporte..." -ForegroundColor Yellow
$report = Invoke-RestMethod -Uri "$baseUrl/supervisor/reports/assign" -Method POST -Headers @{
    Authorization = "Bearer $($supervisor.token)"
} -Body (@{
    brigadistaId = $brigadistas.data[0].id
    title = "Reporte Test"
    description = "Reporte de prueba"
    dueDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    periodStart = (Get-Date).ToString("yyyy-MM-dd")
    periodEnd = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
} | ConvertTo-Json) -ContentType "application/json"

Write-Host "   Reporte ID: $($report.data.id)" -ForegroundColor Green
Write-Host "   Estado: $($report.data.status)" -ForegroundColor Gray
Write-Host ""

# 4. Login Brigadista
Write-Host "4. Login Brigadista..." -ForegroundColor Yellow
$brigadista = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{
    username = "brigadista1"
    password = "brigadista123"
} | ConvertTo-Json) -ContentType "application/json"

Write-Host "   Token obtenido" -ForegroundColor Green
Write-Host ""

# 5. Ver mis reportes
Write-Host "5. Ver mis reportes..." -ForegroundColor Yellow
$myReports = Invoke-RestMethod -Uri "$baseUrl/brigadista/reports" -Method GET -Headers @{
    Authorization = "Bearer $($brigadista.token)"
}

Write-Host "   Reportes asignados: $($myReports.data.Count)" -ForegroundColor Green
Write-Host ""

# 6. Actualizar reporte
Write-Host "6. Actualizar reporte..." -ForegroundColor Yellow
$update = Invoke-RestMethod -Uri "$baseUrl/brigadista/reports/$($report.data.id)" -Method PUT -Headers @{
    Authorization = "Bearer $($brigadista.token)"
} -Body (@{
    description = "Reporte actualizado"
    activities = @(
        @{
            date = (Get-Date).ToString("yyyy-MM-dd")
            description = "Actividad 1"
            location = "Zona Norte"
            findings = "Todo en orden"
        }
    )
    observations = "Sin novedades"
} | ConvertTo-Json -Depth 10) -ContentType "application/json"

Write-Host "   Estado: $($update.data.status)" -ForegroundColor Green
Write-Host ""

# 7. Enviar para revision
Write-Host "7. Enviar para revision..." -ForegroundColor Yellow
$submit = Invoke-RestMethod -Uri "$baseUrl/brigadista/reports/$($report.data.id)/submit" -Method POST -Headers @{
    Authorization = "Bearer $($brigadista.token)"
}

Write-Host "   Estado: $($submit.data.status)" -ForegroundColor Green
Write-Host ""

# 8. Supervisor aprueba
Write-Host "8. Supervisor aprueba..." -ForegroundColor Yellow
$review = Invoke-RestMethod -Uri "$baseUrl/supervisor/reports/$($report.data.id)/review" -Method PUT -Headers @{
    Authorization = "Bearer $($supervisor.token)"
} -Body (@{
    action = "APPROVE"
    comments = "Excelente trabajo"
    observations = @()
} | ConvertTo-Json) -ContentType "application/json"

Write-Host "   Estado: $($review.data.status)" -ForegroundColor Green
Write-Host ""

Write-Host "Test completado exitosamente!" -ForegroundColor Green
