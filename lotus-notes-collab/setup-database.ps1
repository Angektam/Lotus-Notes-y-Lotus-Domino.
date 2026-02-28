# Script para crear la base de datos MySQL
# Sistema Lotus Domino

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Base de Datos Lotus Domino" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Leer credenciales del .env
$envContent = Get-Content .env
$dbUser = ($envContent | Select-String "DB_USER=").ToString().Split("=")[1]
$dbPassword = ($envContent | Select-String "DB_PASSWORD=").ToString().Split("=")[1]
$dbHost = ($envContent | Select-String "DB_HOST=").ToString().Split("=")[1]

Write-Host "Configuración detectada:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Usuario: $dbUser" -ForegroundColor Gray
Write-Host ""

Write-Host "Creando base de datos..." -ForegroundColor Yellow

# Ejecutar script SQL
$mysqlCommand = "mysql -h $dbHost -u $dbUser -p$dbPassword < create-database.sql"

try {
    Invoke-Expression $mysqlCommand
    Write-Host "✓ Base de datos creada exitosamente" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al crear base de datos" -ForegroundColor Red
    Write-Host "  Asegúrate de que MySQL esté corriendo" -ForegroundColor Yellow
    Write-Host "  Verifica las credenciales en .env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Puedes crear la base de datos manualmente:" -ForegroundColor Yellow
    Write-Host "  mysql -u root -p" -ForegroundColor Gray
    Write-Host "  CREATE DATABASE lotus_domino_db;" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Setup completado" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
