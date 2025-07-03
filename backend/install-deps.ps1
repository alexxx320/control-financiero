# Script de instalación de dependencias para el backend
Write-Host "🚀 Instalando dependencias del backend..." -ForegroundColor Green

# Cambiar al directorio del backend
Set-Location $PSScriptRoot

Write-Host "📦 Instalando dependencias de producción..." -ForegroundColor Yellow
npm install cookie-parser@^1.4.6 helmet@^7.0.0 express-rate-limit@^6.7.0

Write-Host "🔧 Instalando dependencias de desarrollo..." -ForegroundColor Yellow  
npm install --save-dev @types/cookie-parser@^1.4.4

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Ahora descomenta las líneas de seguridad en src/main.ts" -ForegroundColor Cyan
    Write-Host "📝 Luego ejecuta: npm run start:dev" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    Write-Host "💡 Intenta ejecutar manualmente:" -ForegroundColor Yellow
    Write-Host "   npm install cookie-parser helmet express-rate-limit" -ForegroundColor White
    Write-Host "   npm install --save-dev @types/cookie-parser" -ForegroundColor White
}

Read-Host "Presiona Enter para continuar..."
