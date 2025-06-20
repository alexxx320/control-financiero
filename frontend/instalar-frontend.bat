@echo off
echo ===================================
echo  CONTROL FINANCIERO - FRONTEND
echo ===================================
echo.

echo Instalando dependencias...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas correctamente!
echo.
echo Para iniciar el servidor de desarrollo, ejecuta:
echo   npm start
echo.
echo Para construir la aplicacion para produccion:
echo   npm run build:prod
echo.
pause
