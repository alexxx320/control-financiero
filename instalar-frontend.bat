@echo off
echo ==========================================
echo   Instalacion del Frontend Angular
echo ==========================================

cd frontend

echo.
echo Instalando dependencias de Node.js...
call npm install

if %ERRORLEVEL% neq 0 (
    echo Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo Instalando Chart.js para compatibilidad...
call npm install chart.js@4.4.0 chartjs-adapter-date-fns@3.0.0

echo.
echo Instalando dependencias adicionales de Angular Material...
call npm install @angular/cdk@17.0.0

echo.
echo ==========================================
echo   Instalacion completada exitosamente
echo ==========================================
echo.
echo Para ejecutar el frontend:
echo   1. cd frontend
echo   2. npm start
echo.
echo Para compilar para produccion:
echo   1. cd frontend
echo   2. npm run build:prod
echo.
pause
