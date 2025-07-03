@echo off
echo 🚀 Instalando dependencias del backend...

cd /d "%~dp0"

echo 📦 Instalando dependencias de producción...
call npm install cookie-parser helmet express-rate-limit

echo 🔧 Instalando dependencias de desarrollo...
call npm install --save-dev @types/cookie-parser

echo ✅ Dependencias instaladas correctamente!
echo.
echo Ahora puedes ejecutar:
echo npm run start:dev

pause
