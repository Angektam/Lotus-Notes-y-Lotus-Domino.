# Script para arrancar el sistema completo
Write-Host "🚀 Iniciando Sistema Lotus Notes..." -ForegroundColor Cyan

# Matar procesos node existentes
Write-Host "⏹  Limpiando procesos anteriores..." -ForegroundColor Yellow
taskkill /IM node.exe /F 2>$null
Start-Sleep -Seconds 1

# Arrancar Backend
Write-Host "🔧 Iniciando Backend (puerto 4000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\lotus-notes-collab'; npm start" -WindowStyle Normal

# Esperar a que el backend levante
Write-Host "⏳ Esperando backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar que el backend esté listo
$backendReady = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body '{"username":"x","password":"x"}' -ContentType "application/json" -ErrorAction SilentlyContinue 2>$null
    } catch {}
    
    try {
        $test = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 2 -ErrorAction SilentlyContinue
        $backendReady = $true
        break
    } catch {
        # 401/404 también significa que el servidor está corriendo
        if ($_.Exception.Response.StatusCode.value__ -gt 0) {
            $backendReady = $true
            break
        }
    }
    Start-Sleep -Seconds 2
}

Write-Host "✅ Backend listo" -ForegroundColor Green

# Arrancar Frontend
Write-Host "🎨 Iniciando Frontend (puerto 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\lotus-notes-frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Sistema iniciado correctamente!" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "👤 admin      / admin123" -ForegroundColor White
Write-Host "👤 supervisor / admin123" -ForegroundColor White
Write-Host "👤 brigadista / admin123" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
