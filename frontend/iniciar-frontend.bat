@echo off
echo ===================================
echo  INICIANDO FRONTEND ANGULAR
echo ===================================
echo.
echo Verificando dependencias...

if not exist "node_modules" (
    echo Las dependencias no estan instaladas.
    echo Ejecutando instalacion...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error al instalar dependencias
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor de desarrollo...
echo.
echo La aplicacion estara disponible en: http://localhost:4200
echo Presiona Ctrl+C para detener el servidor
echo.

call npm start
