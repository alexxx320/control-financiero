@echo off
echo 🚀 Iniciando Control Financiero Backend...
echo.

REM Verificar si estamos en el directorio correcto
if not exist "src\main.ts" (
    echo ❌ Error: Ejecuta este script desde el directorio backend
    echo    Ubicacion actual: %CD%
    echo    Ubicacion esperada: C:\Users\alext\proyectog\control-financiero\backend
    pause
    exit /b 1
)

echo ✅ Directorio correcto detectado
echo.

REM Verificar si existe node_modules
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias ya instaladas
)

echo.
echo 🏗️  Iniciando servidor en modo desarrollo...
echo    URL: http://localhost:3000
echo    API: http://localhost:3000/api
echo    Auth: http://localhost:3000/api/auth/login
echo    Docs: http://localhost:3000/api/docs
echo    Health: http://localhost:3000/health
echo.
echo ⏹️  Presiona Ctrl+C para detener el servidor
echo.

call npm run start:dev
