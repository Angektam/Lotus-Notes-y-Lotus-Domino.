$base = "http://localhost:4000/api"
$pass = 0
$fail = 0
$errors = @()

function Invoke-Test {
    param($name, $method, $url, $body, $token, $expectedStatus)
    try {
        $headers = @{ "Content-Type" = "application/json" }
        if ($token) { $headers["Authorization"] = "Bearer $token" }
        
        $params = @{ Method = $method; Uri = $url; Headers = $headers; ErrorAction = "Stop"; UseBasicParsing = $true }
        if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 5) }
        
        $resp = Invoke-WebRequest @params
        $status = [int]$resp.StatusCode
        $data = $resp.Content | ConvertFrom-Json
        
        if ($status -eq $expectedStatus) {
            Write-Host "  [PASS] $name (HTTP $status)" -ForegroundColor Green
            $script:pass++
            return $data
        } else {
            Write-Host "  [FAIL] $name - esperado $expectedStatus, obtuvo $status" -ForegroundColor Red
            $script:fail++
            $script:errors += "$name`: esperado $expectedStatus, obtuvo $status"
            return $data
        }
    } catch {
        $status = 0
        try { $status = [int]$_.Exception.Response.StatusCode.value__ } catch {}
        $bodyResp = ""
        try { $bodyResp = $_.ErrorDetails.Message } catch {}
        
        if ($status -eq $expectedStatus) {
            Write-Host "  [PASS] $name (HTTP $status)" -ForegroundColor Green
            $script:pass++
            try { return ($bodyResp | ConvertFrom-Json) } catch { return $null }
        } else {
            Write-Host "  [FAIL] $name - esperado $expectedStatus, obtuvo $status | $bodyResp" -ForegroundColor Red
            $script:fail++
            $script:errors += "$name`: esperado $expectedStatus, obtuvo $status"
            return $null
        }
    }
}

Write-Host "`n========== 1. HEALTH CHECK ==========" -ForegroundColor Cyan
Invoke-Test "GET /" "GET" "http://localhost:4000/" $null $null 200 | Out-Null

Write-Host "`n========== 2. AUTH - VALIDACIONES ==========" -ForegroundColor Cyan
Invoke-Test "Registro sin password" "POST" "$base/auth/register" @{username="x";email="a@b.com";password=""} $null 400 | Out-Null
Invoke-Test "Registro email invalido" "POST" "$base/auth/register" @{username="testuser";email="noemail";password="123456"} $null 400 | Out-Null
Invoke-Test "Registro username corto" "POST" "$base/auth/register" @{username="ab";email="a@b.com";password="123456"} $null 400 | Out-Null

Write-Host "`n========== 3. AUTH - REGISTRO VALIDO ==========" -ForegroundColor Cyan
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$regData = Invoke-Test "Registro usuario nuevo" "POST" "$base/auth/register" @{
    username="testuser$ts"; email="test$ts@test.com"; password="Test1234"; fullName="Test User"
} $null 201

$token = $null
$userId = $null
if ($regData) {
    $token = $regData.token
    $userId = $regData.user.id
}

Write-Host "`n========== 4. AUTH - LOGIN ==========" -ForegroundColor Cyan
$loginData = Invoke-Test "Login con email" "POST" "$base/auth/login" @{email="test$ts@test.com"; password="Test1234"} $null 200
if ($loginData) { $token = $loginData.token }

Invoke-Test "Login credenciales invalidas" "POST" "$base/auth/login" @{email="test$ts@test.com"; password="wrong"} $null 401 | Out-Null
Invoke-Test "Login sin password" "POST" "$base/auth/login" @{email="test$ts@test.com"} $null 400 | Out-Null

Write-Host "`n========== 5. AUTH - PERFIL ==========" -ForegroundColor Cyan
Invoke-Test "GET /auth/profile autenticado" "GET" "$base/auth/profile" $null $token 200 | Out-Null
Invoke-Test "GET /auth/profile sin token" "GET" "$base/auth/profile" $null $null 401 | Out-Null

Write-Host "`n========== 6. NOTAS ==========" -ForegroundColor Cyan
$note = Invoke-Test "Crear nota" "POST" "$base/notes" @{title="Nota Test";content="Contenido test";priority="medium"} $token 201
$noteId = $null
if ($note -and $note.note) { $noteId = $note.note.id }
Invoke-Test "Listar notas" "GET" "$base/notes" $null $token 200 | Out-Null
if ($noteId) {
    Invoke-Test "Eliminar nota" "DELETE" "$base/notes/$noteId" $null $token 200 | Out-Null
}
Invoke-Test "Notas sin token" "GET" "$base/notes" $null $null 401 | Out-Null

Write-Host "`n========== 7. TAREAS ==========" -ForegroundColor Cyan
$task = Invoke-Test "Crear tarea" "POST" "$base/tasks" @{title="Tarea Test";priority="high";assignedTo=$userId} $token 201
$taskId = $null
if ($task -and $task.task) { $taskId = $task.task.id }
Invoke-Test "Mis tareas" "GET" "$base/tasks/my-tasks" $null $token 200 | Out-Null
if ($taskId) {
    Invoke-Test "Actualizar tarea (propietario)" "PUT" "$base/tasks/$taskId" @{status="in_progress"} $token 200 | Out-Null
    Invoke-Test "Eliminar tarea (propietario)" "DELETE" "$base/tasks/$taskId" $null $token 200 | Out-Null
}
Invoke-Test "Tareas sin token" "GET" "$base/tasks/my-tasks" $null $null 401 | Out-Null

Write-Host "`n========== 8. REPORTES ==========" -ForegroundColor Cyan
$report = Invoke-Test "Crear reporte" "POST" "$base/reports" @{
    studentName="Juan Perez"; academicUnit="FIME"; career="ISC";
    projectName="Proyecto Test"; reportMonth="enero"; reportYear=2025; totalHours=40
} $token 201
$reportId = $null
if ($report -and $report.data) { $reportId = $report.data.id }
Invoke-Test "Listar reportes" "GET" "$base/reports" $null $token 200 | Out-Null
if ($reportId) {
    Invoke-Test "Obtener reporte por ID" "GET" "$base/reports/$reportId" $null $token 200 | Out-Null
    Invoke-Test "Actualizar reporte" "PUT" "$base/reports/$reportId" @{observations="Actualizado"} $token 200 | Out-Null
}
Invoke-Test "Reporte horas negativas" "POST" "$base/reports" @{
    studentName="Test"; totalHours=-5; reportMonth="enero"; reportYear=2025
} $token 400 | Out-Null

Write-Host "`n========== 9. NOTIFICACIONES ==========" -ForegroundColor Cyan
Invoke-Test "Listar notificaciones" "GET" "$base/notifications" $null $token 200 | Out-Null
Invoke-Test "Contador no leidas" "GET" "$base/notifications/unread-count" $null $token 200 | Out-Null
Invoke-Test "Marcar todas leidas" "PUT" "$base/notifications/mark-all-read" $null $token 200 | Out-Null

Write-Host "`n========== 10. ADMIN - SIN ROL ==========" -ForegroundColor Cyan
Invoke-Test "Admin stats sin rol admin" "GET" "$base/admin/statistics" $null $token 403 | Out-Null
Invoke-Test "Admin reports sin rol admin" "GET" "$base/admin/reports" $null $token 403 | Out-Null

Write-Host "`n========== 11. RUTAS INEXISTENTES ==========" -ForegroundColor Cyan
Invoke-Test "Ruta 404" "GET" "$base/ruta-que-no-existe" $null $null 404 | Out-Null

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TOTAL: $($pass + $fail) pruebas" -ForegroundColor White
Write-Host "  PASS:  $pass" -ForegroundColor Green
Write-Host "  FAIL:  $fail" -ForegroundColor Red
if ($errors.Count -gt 0) {
    Write-Host "`n  Fallos detallados:" -ForegroundColor Yellow
    foreach ($e in $errors) { Write-Host "    - $e" -ForegroundColor Yellow }
}
Write-Host "========================================`n" -ForegroundColor Cyan
