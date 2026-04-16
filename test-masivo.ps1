$BASE = "http://localhost:4000/api"
$pass = 0
$fail = 0
$results = @()

function Test-Endpoint {
    param($name, $method, $url, $body, $token, $expectedStatus)
    $headers = @{ "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    try {
        $params = @{ Method = $method; Uri = $url; Headers = $headers; ErrorAction = "Stop"; UseBasicParsing = $true }
        if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 5) }
        $res = Invoke-WebRequest @params
        $code = [int]$res.StatusCode
    } catch {
        $code = [int]$_.Exception.Response.StatusCode.value__
        if (-not $code) { $code = 0 }
    }
    $ok = ($code -eq $expectedStatus) -or ($expectedStatus -eq 0 -and $code -ge 200 -and $code -lt 300)
    $script:results += [PSCustomObject]@{ Test=$name; Status=$code; Expected=$expectedStatus; Result=if($ok){"PASS"}else{"FAIL"} }
    if ($ok) { $script:pass++ } else { $script:fail++ }
    $icon = if ($ok) { "[PASS]" } else { "[FAIL]" }
    Write-Host "$icon [$code] $name" -ForegroundColor $(if($ok){"Green"}else{"Red"})
}

function Get-Token {
    param($username, $password)
    try {
        $body = @{ username=$username; password=$password } | ConvertTo-Json
        $res = Invoke-RestMethod -Method POST -Uri "$BASE/auth/login" -Body $body -ContentType "application/json" -ErrorAction Stop
        return $res.token
    } catch { return $null }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   TESTEO MASIVO - LOTUS NOTES COLLAB" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ── AUTH ──────────────────────────────────────────
Write-Host "-- AUTH --" -ForegroundColor Yellow
Test-Endpoint "Login admin correcto"       POST "$BASE/auth/login"    @{username="admin";password="admin123"}       $null 200
Test-Endpoint "Login supervisor correcto"  POST "$BASE/auth/login"    @{username="supervisor";password="admin123"}  $null 200
Test-Endpoint "Login brigadista correcto"  POST "$BASE/auth/login"    @{username="brigadista";password="admin123"}  $null 200
Test-Endpoint "Login password incorrecta"  POST "$BASE/auth/login"    @{username="admin";password="wrong"}          $null 401
Test-Endpoint "Login usuario inexistente"  POST "$BASE/auth/login"    @{username="noexiste";password="x"}           $null 401
Test-Endpoint "Login sin body"             POST "$BASE/auth/login"    @{}                                           $null 400
$ts = [int](Get-Date -UFormat %s)
Test-Endpoint "Registro usuario nuevo"     POST "$BASE/auth/register" @{username="testuser$ts";email="test$ts@test.com";password="test1234";fullName="Test User"} $null 201
Test-Endpoint "Registro email duplicado"   POST "$BASE/auth/register" @{username="testuser${ts}b";email="test$ts@test.com";password="test1234"} $null 409
Test-Endpoint "Sin token - protegido"      GET  "$BASE/reports"       $null $null 401

$tokenAdmin = Get-Token "admin" "admin123"
$tokenSup   = Get-Token "supervisor" "admin123"
$tokenBrig  = Get-Token "brigadista" "admin123"
$tokenBrig1 = Get-Token "carlos.mendoza.1" "brigada123"

Write-Host ""
Write-Host "-- NOTAS --" -ForegroundColor Yellow
Test-Endpoint "GET notas admin"            GET  "$BASE/notes"         $null $tokenAdmin 200
Test-Endpoint "POST nota valida"           POST "$BASE/notes"         @{title="Nota test";content="Contenido test";priority="medium"} $tokenAdmin 201
Test-Endpoint "POST nota sin titulo"       POST "$BASE/notes"         @{content="sin titulo"} $tokenAdmin 400
Test-Endpoint "POST nota sin contenido"    POST "$BASE/notes"         @{title="sin contenido"} $tokenAdmin 400
Test-Endpoint "GET notas brigadista"       GET  "$BASE/notes"         $null $tokenBrig 200

try {
    $notaRes = Invoke-RestMethod -Method POST -Uri "$BASE/notes" -Body (@{title="Nota editable";content="Para editar";priority="high"} | ConvertTo-Json) -Headers @{Authorization="Bearer $tokenAdmin";"Content-Type"="application/json"}
    $notaId = $notaRes.note.id
} catch { $notaId = 1 }

Test-Endpoint "PUT nota existente"         PUT    "$BASE/notes/$notaId" @{title="Nota editada";content="Editado"} $tokenAdmin 200
Test-Endpoint "DELETE nota existente"      DELETE "$BASE/notes/$notaId" $null $tokenAdmin 200
Test-Endpoint "GET nota inexistente"       GET    "$BASE/notes/99999"   $null $tokenAdmin 404

Write-Host ""
Write-Host "-- TAREAS --" -ForegroundColor Yellow
Test-Endpoint "GET mis tareas"             GET  "$BASE/tasks/my-tasks" $null $tokenAdmin 200
Test-Endpoint "POST tarea valida"          POST "$BASE/tasks"          @{title="Tarea test";priority="high";assignedTo=1} $tokenAdmin 201
Test-Endpoint "POST tarea sin titulo"      POST "$BASE/tasks"          @{priority="low"} $tokenAdmin 400
Test-Endpoint "GET tareas brigadista"      GET  "$BASE/tasks/my-tasks" $null $tokenBrig 200

try {
    $tareaRes = Invoke-RestMethod -Method POST -Uri "$BASE/tasks" -Body (@{title="Tarea borrable";priority="low";assignedTo=1} | ConvertTo-Json) -Headers @{Authorization="Bearer $tokenAdmin";"Content-Type"="application/json"}
    $tareaId = $tareaRes.task.id
} catch { $tareaId = 1 }

Test-Endpoint "PUT tarea cambiar estado"   PUT    "$BASE/tasks/$tareaId" @{status="completed"} $tokenAdmin 200
Test-Endpoint "DELETE tarea"               DELETE "$BASE/tasks/$tareaId" $null $tokenAdmin 200

Write-Host ""
Write-Host "-- CALENDARIO --" -ForegroundColor Yellow
Test-Endpoint "GET eventos"                GET  "$BASE/calendar"      $null $tokenAdmin 200
Test-Endpoint "POST evento valido"         POST "$BASE/calendar"      @{title="Evento test";startDate="2026-04-01T10:00:00";endDate="2026-04-01T11:00:00";eventType="meeting"} $tokenAdmin 201
Test-Endpoint "POST evento sin titulo"     POST "$BASE/calendar"      @{startDate="2026-04-01T10:00:00";endDate="2026-04-01T11:00:00"} $tokenAdmin 400
Test-Endpoint "POST evento fechas inv"     POST "$BASE/calendar"      @{title="Inv";startDate="2026-04-02T10:00:00";endDate="2026-04-01T09:00:00";eventType="meeting"} $tokenAdmin 400

Write-Host ""
Write-Host "-- MENSAJES --" -ForegroundColor Yellow
Test-Endpoint "GET inbox"                  GET  "$BASE/messages/inbox" $null $tokenAdmin 200
Test-Endpoint "GET sent"                   GET  "$BASE/messages/sent"  $null $tokenAdmin 200
Test-Endpoint "POST mensaje valido"        POST "$BASE/messages"       @{receiverId=2;subject="Test msg";body="Hola supervisor";priority="normal"} $tokenAdmin 201
Test-Endpoint "POST mensaje sin asunto"    POST "$BASE/messages"       @{receiverId=2;body="sin asunto"} $tokenAdmin 400
Test-Endpoint "POST mensaje sin receptor"  POST "$BASE/messages"       @{subject="x";body="sin receptor"} $tokenAdmin 400

Write-Host ""
Write-Host "-- REPORTES ESTUDIANTE --" -ForegroundColor Yellow
Test-Endpoint "GET reportes"               GET  "$BASE/reports"        $null $tokenAdmin 200
$reportBody = @{
    studentName="Test Estudiante"; academicUnit="FI"; career="ISC"; accountNumber="12345678"
    dependencyName="UNAM"; projectName="Proyecto Test"; startDate="2026-01-01"; endDate="2026-06-30"
    totalHours=480; reportMonth="enero"; reportYear=2026
    objectives=@(@{objective="Obj1";goals="Meta1";activities="Act1"})
    participants=@(@{activity="Act1";count=10})
}
Test-Endpoint "POST reporte valido"        POST "$BASE/reports"        $reportBody $tokenAdmin 201
Test-Endpoint "POST reporte sin nombre"    POST "$BASE/reports"        @{academicUnit="FI"} $tokenAdmin 400

Write-Host ""
Write-Host "-- ADMIN --" -ForegroundColor Yellow
Test-Endpoint "GET admin/reports"          GET  "$BASE/admin/reports"  $null $tokenAdmin 200
Test-Endpoint "GET admin/statistics"       GET  "$BASE/admin/statistics" $null $tokenAdmin 200
Test-Endpoint "GET admin/students"         GET  "$BASE/admin/students" $null $tokenAdmin 200
Test-Endpoint "Admin acceso sin rol"       GET  "$BASE/admin/reports"  $null $tokenBrig 403
Test-Endpoint "Bulk review sin IDs"        POST "$BASE/admin/reports/bulk-review" @{ids=@();action="approve"} $tokenAdmin 400
Test-Endpoint "Bulk review accion inv"     POST "$BASE/admin/reports/bulk-review" @{ids=@(1);action="invalid"} $tokenAdmin 400

Write-Host ""
Write-Host "-- SUPERVISOR --" -ForegroundColor Yellow
Test-Endpoint "GET brigadistas"            GET  "$BASE/supervisor/brigadistas" $null $tokenSup 200
Test-Endpoint "GET dashboard stats"        GET  "$BASE/supervisor/dashboard/stats" $null $tokenSup 200
Test-Endpoint "GET reportes pendientes"    GET  "$BASE/supervisor/reports/pending" $null $tokenSup 200
Test-Endpoint "GET todos los reportes"     GET  "$BASE/supervisor/reports" $null $tokenSup 200
Test-Endpoint "Supervisor sin rol"         GET  "$BASE/supervisor/brigadistas" $null $tokenBrig 403
Test-Endpoint "POST brigadista valido"     POST "$BASE/supervisor/brigadistas" @{username="brig.test.$ts";email="brig.test.$ts@test.com";password="test1234";fullName="Brig Test";zone="Norte";team="Alpha"} $tokenSup 201
Test-Endpoint "POST brigadista dup email"  POST "$BASE/supervisor/brigadistas" @{username="brig.test.${ts}b";email="brig.test.$ts@test.com";password="test1234"} $tokenSup 400

Write-Host ""
Write-Host "-- BRIGADISTA --" -ForegroundColor Yellow
Test-Endpoint "GET mis reportes"           GET  "$BASE/brigadista/reports" $null $tokenBrig 200
Test-Endpoint "GET dashboard stats"        GET  "$BASE/brigadista/dashboard/stats" $null $tokenBrig 200
Test-Endpoint "GET mi perfil"              GET  "$BASE/brigadista/profile" $null $tokenBrig 200
Test-Endpoint "PUT mi perfil"              PUT  "$BASE/brigadista/profile" @{fullName="Brigadista Actualizado";zone="Sur";team="Beta"} $tokenBrig 200
Test-Endpoint "GET perfil sin token"       GET  "$BASE/brigadista/profile" $null $null 401

if ($tokenBrig1) {
    Test-Endpoint "GET perfil carlos.mendoza.1"   GET "$BASE/brigadista/profile"  $null $tokenBrig1 200
    Test-Endpoint "GET reportes carlos.mendoza.1" GET "$BASE/brigadista/reports"  $null $tokenBrig1 200
    Test-Endpoint "GET stats carlos.mendoza.1"    GET "$BASE/brigadista/dashboard/stats" $null $tokenBrig1 200
}

Write-Host ""
Write-Host "-- NOTIFICACIONES --" -ForegroundColor Yellow
Test-Endpoint "GET notificaciones"         GET  "$BASE/notifications"  $null $tokenAdmin 200
Test-Endpoint "GET unread-count"           GET  "$BASE/notifications/unread-count" $null $tokenAdmin 200
Test-Endpoint "PUT mark-all-read"          PUT  "$BASE/notifications/mark-all-read" $null $tokenAdmin 200

Write-Host ""
Write-Host "-- GALERIA --" -ForegroundColor Yellow
Test-Endpoint "GET galeria"                GET  "$BASE/gallery"        $null $tokenAdmin 200

Write-Host ""
Write-Host "-- ANALITICAS --" -ForegroundColor Yellow
Test-Endpoint "GET analytics supervisor"   GET  "$BASE/analytics/supervisor" $null $tokenSup 200
Test-Endpoint "GET analytics brigadista"   GET  "$BASE/analytics/brigadista" $null $tokenBrig 200

Write-Host ""
Write-Host "-- EDGE CASES --" -ForegroundColor Yellow
Test-Endpoint "Ruta inexistente"           GET  "$BASE/no-existe"      $null $tokenAdmin 404
Test-Endpoint "Token malformado"           GET  "$BASE/notes"          $null "token.invalido.xxx" 401

# Testeo con multiples brigadistas del seed
Write-Host ""
Write-Host "-- BRIGADISTAS DEL SEED (muestra) --" -ForegroundColor Yellow
$seedUsers = @(
    @{u="ana.garcia.2";p="brigada123"},
    @{u="luis.hernandez.3";p="brigada123"},
    @{u="sofia.gonzalez.8";p="brigada123"},
    @{u="valentina.ramirez.10";p="brigada123"},
    @{u="camila.diaz.12";p="brigada123"}
)
foreach ($su in $seedUsers) {
    $t = Get-Token $su.u $su.p
    if ($t) {
        Test-Endpoint "Login + perfil: $($su.u)" GET "$BASE/brigadista/profile" $null $t 200
    } else {
        Test-Endpoint "Login fallido: $($su.u)" GET "$BASE/brigadista/profile" $null $null 401
    }
}

# ── RESUMEN ───────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   RESULTADOS FINALES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PASS : $pass" -ForegroundColor Green
Write-Host "  FAIL : $fail" -ForegroundColor Red
Write-Host "  TOTAL: $($pass + $fail)" -ForegroundColor White

$failedTests = $results | Where-Object { $_.Result -eq "FAIL" }
if ($failedTests.Count -gt 0) {
    Write-Host ""
    Write-Host "  Tests fallidos:" -ForegroundColor Red
    $failedTests | ForEach-Object {
        Write-Host "    FAIL: $($_.Test) - got $($_.Status), expected $($_.Expected)" -ForegroundColor Red
    }
}

$results | Export-Csv -Path "test-results.csv" -NoTypeInformation -Encoding UTF8
Write-Host ""
Write-Host "  Resultados exportados a: test-results.csv" -ForegroundColor Gray
