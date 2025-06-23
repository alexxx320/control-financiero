# Script PowerShell para reparar dependencias
# Ejecutar desde la carpeta backend con: powershell -ExecutionPolicy Bypass -File fix-deps.ps1

Write-Host "🔧 Reparando dependencias del backend..." -ForegroundColor Yellow

# Limpiar archivos de lock existentes
Write-Host "📁 Limpiando archivos de lock..." -ForegroundColor Cyan
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }
if (Test-Path "npm-shrinkwrap.json") { Remove-Item "npm-shrinkwrap.json" -Force }

# Limpiar cache de npm
Write-Host "🧹 Limpiando cache de npm..." -ForegroundColor Cyan
npm cache clean --force

# Limpiar node_modules
Write-Host "📦 Limpiando node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }

# Reinstalar dependencias
Write-Host "⬇️ Reinstalando dependencias..." -ForegroundColor Cyan
npm install

# Verificar que el build funciona
Write-Host "🏗️ Verificando build..." -ForegroundColor Cyan
npm run build

Write-Host "✅ ¡Dependencias reparadas! Ahora puedes hacer deploy en Railway." -ForegroundColor Green
