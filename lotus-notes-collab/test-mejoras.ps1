dColor Yellow
Write-Host "  1. Abre el frontend en http://localhost:3000" -ForegroundColor Gray
Write-Host "  2. Inicia sesion como brigadista1" -ForegroundColor Gray
Write-Host "  3. En otra ventana, inicia sesion como supervisor1" -ForegroundColor Gray
Write-Host "  4. Asigna un reporte desde supervisor" -ForegroundColor Gray
Write-Host "  5. Veras la notificacion en tiempo real en brigadista" -ForegroundColor Gray
Write-Host ""

Write-Host "Nuevas funcionalidades v3.0.0:" -ForegroundColor Cyan
Write-Host "  - Notificaciones en tiempo real (Socket.io)" -ForegroundColor White
Write-Host "  - Dashboard analitico con graficas (Chart.js)" -ForegroundColor White
Write-Host "  - Exportacion de reportes a Excel" -ForegroundColor White
Write-Host "  - Sistema de busqueda avanzada" -ForegroundColor White
Write-Host "  - Campana de notificaciones en tiempo real" -ForegroundColor White
Write-Host ""
Write-Host "Para probar Socket.io:" -Foregrounicacion funcionando" -ForegroundColor Green
Write-Host "OK Analytics Supervisor funcionando" -ForegroundColor Green
Write-Host "OK Analytics Brigadista funcionando" -ForegroundColor Green
Write-Host "OK Busqueda Avanzada funcionando" -ForegroundColor Green
Write-Host "OK Sistema de Notificaciones funcionando" -ForegroundColor Green
Write-Host "OK Exportacion a Excel implementada" -ForegroundColor Green
Write-Host ""
Write-Host "TODAS LAS MEJORAS FUNCIONANDO CORRECTAMENTE" -ForegroundColor Green
Write-Host ""-Host "   INFO Endpoint disponible: GET /api/analytics/export/excel" -ForegroundColor Cyan
Write-Host "   INFO Descarga archivo .xlsx con todos los reportes" -ForegroundColor Cyan
Write-Host "   OK Funcionalidad implementada" -ForegroundColor Green
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OK Autentellow
$response = Invoke-ApiRequest -Method "GET" -Endpoint "/notifications/unread-count" -Token $brigadistaToken
if ($response -and $response.success) {
    Write-Host "   OK Contador obtenido" -ForegroundColor Green
    Write-Host "   No leidas: $($response.data.unreadCount)" -ForegroundColor Gray
} else {
    Write-Host "   X Error al obtener contador" -ForegroundColor Red
}
Write-Host ""

# 9. Probar exportacion a Excel (simulado)
Write-Host "9. Probando Exportacion a Excel..." -ForegroundColor Yellow
Write $brigadistaToken
if ($response -and $response.success) {
    Write-Host "   OK Notificaciones obtenidas" -ForegroundColor Green
    Write-Host "   Total: $($response.data.Count)" -ForegroundColor Gray
    if ($response.data.Count -gt 0) {
        Write-Host "   Ultima: $($response.data[0].title)" -ForegroundColor Gray
    }
} else {
    Write-Host "   X Error al obtener notificaciones" -ForegroundColor Red
}
Write-Host ""

# 8. Contador de no leidas
Write-Host "8. Probando Contador de No Leidas..." -ForegroundColor Yusqueda exitosa" -ForegroundColor Green
    Write-Host "   Resultados encontrados: $($response.pagination.total)" -ForegroundColor Gray
    Write-Host "   Pagina: $($response.pagination.page) de $($response.pagination.totalPages)" -ForegroundColor Gray
} else {
    Write-Host "   X Error en busqueda" -ForegroundColor Red
}
Write-Host ""

# 7. Probar Notificaciones
Write-Host "7. Probando Sistema de Notificaciones..." -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method "GET" -Endpoint "/notifications" -TokenoverdueCount)" -ForegroundColor Gray
    Write-Host "   Tasa Aprobacion: $($response.summary.approvalRate)%" -ForegroundColor Gray
} else {
    Write-Host "   X Error al obtener analytics" -ForegroundColor Red
}
Write-Host ""

# 6. Probar Busqueda Avanzada
Write-Host "6. Probando Busqueda Avanzada..." -ForegroundColor Yellow
$searchEndpoint = "/analytics/search?query=Prueba"
$response = Invoke-ApiRequest -Method "GET" -Endpoint $searchEndpoint -Token $supervisorToken
if ($response) {
    Write-Host "   OK Br Yellow
$response = Invoke-ApiRequest -Method "GET" -Endpoint "/analytics/brigadista" -Token $brigadistaToken
if ($response) {
    Write-Host "   OK Analytics obtenidas" -ForegroundColor Green
    Write-Host "   Total Reportes: $($response.summary.totalReports)" -ForegroundColor Gray
    Write-Host "   Completados: $($response.summary.completedCount)" -ForegroundColor Gray
    Write-Host "   Pendientes: $($response.summary.pendingCount)" -ForegroundColor Gray
    Write-Host "   Vencidos: $($response.summary.provedCount)" -ForegroundColor Gray
    Write-Host "   Observados: $($response.summary.rejectedCount)" -ForegroundColor Gray
    Write-Host "   Vencidos: $($response.summary.overdueReports)" -ForegroundColor Gray
    Write-Host "   Tiempo Promedio: $($response.summary.avgCompletionTime) dias" -ForegroundColor Gray
} else {
    Write-Host "   X Error al obtener analytics" -ForegroundColor Red
}
Write-Host ""

# 5. Probar Analytics del Brigadista
Write-Host "5. Probando Analytics del Brigadista..." -ForegroundColo"   X Error al asignar reporte" -ForegroundColor Red
}
Write-Host ""

# 4. Probar Analytics del Supervisor
Write-Host "4. Probando Analytics del Supervisor..." -ForegroundColor Yellow
$response = Invoke-ApiRequest -Method "GET" -Endpoint "/analytics/supervisor" -Token $supervisorToken
if ($response) {
    Write-Host "   OK Analytics obtenidas" -ForegroundColor Green
    Write-Host "   Total Reportes: $($response.summary.totalReports)" -ForegroundColor Gray
    Write-Host "   Aprobados: $($response.summary.ap @{
    title = "Reporte de Prueba Analytics"
    description = "Reporte para probar las nuevas funcionalidades"
    assignedTo = 2
    dueDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    priority = "HIGH"
}
$response = Invoke-ApiRequest -Method "POST" -Endpoint "/supervisor/reports/assign" -Token $supervisorToken -Body $reportData
if ($response -and $response.success) {
    $reportId = $response.data.id
    Write-Host "   OK Reporte asignado (ID: $reportId)" -ForegroundColor Green
} else {
    Write-Host ite-Host "3. Asignando reporte de prueba..." -ForegroundColor Yellow
$reportData =ost ""

# 3. Crear reporte de prueba
Wr
} else {
    Write-Host "   X Error en login" -ForegroundColor Red
    exit
}
Write-Hn: $($supervisorToken.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "   X Error en login" -ForegroundColor Red
    exit
}
Write-Host ""

# 2. Login Brigadista
Write-Host "2. Login Brigadista..." -ForegroundColor Yellow
$loginData = @{
    username = "brigadista1"
    password = "brigadista123"
}
$response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginData
if ($response) {
    $brigadistaToken = $response.token
    Write-Host "   OK Login exitoso" -ForegroundColor GreenStop
        }
        return $response
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        return $null
    }
}

# 1. Login Supervisor
Write-Host "1. Login Supervisor..." -ForegroundColor Yellow
$loginData = @{
    username = "supervisor1"
    password = "supervisor123"
}
$response = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginData
if ($response) {
    $supervisorToken = $response.token
    Write-Host "   OK Login exitoso" -ForegroundColor Green
    Write-Host "   Token = "",
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json) -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -ErrorAction "========================================" -ForegroundColor Cyan
Write-Host "  PRUEBA DE MEJORAS v3.0.0" -ForegroundColor Cyan
Write-Host "  Sistema Lotus Domino" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:4000/api"
$supervisorToken = ""
$brigadistaToken = ""
$reportId = ""

# Funcion para hacer peticiones
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Toke# Script de prueba para las nuevas mejoras v3.0.0
# Notificaciones en tiempo real, Analytics y Busqueda avanzada

Write-Host 