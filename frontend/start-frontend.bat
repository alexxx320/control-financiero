@echo off
echo 🚀 Iniciando Control Financiero Frontend...
echo.

REM Verificar si estamos en el directorio correcto
if not exist "src\main.ts" (
    echo ❌ Error: Ejecuta este script desde el directorio frontend
    echo    Ubicacion actual: %CD%
    echo    Ubicacion esperada: C:\Users\alext\proyectog\control-financiero\frontend
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
echo 🏗️  Iniciando servidor Angular en modo desarrollo...
echo    URL: http://localhost:4200
echo    Backend API: http://localhost:3000/api
echo.
echo ⚠️  IMPORTANTE: Asegúrate de que el backend esté ejecutándose en http://localhost:3000
echo.
echo ⏹️  Presiona Ctrl+C para detener el servidor
echo.

call npm start
