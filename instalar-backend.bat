@echo off
echo =============================================
echo    INSTALACION Y EJECUCION - BACKEND
echo =============================================
echo.

cd /d "%~dp0backend"

echo Paso 1: Instalando herramientas globales...
call npm install -g typescript@5.2.2
call npm install -g @nestjs/cli@10.2.1

echo.
echo Paso 2: Instalando dependencias del proyecto...
call npm install
if %errorlevel% neq 0 (
    echo Reintentando con legacy-peer-deps...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)

echo.
echo Paso 3: Compilando el proyecto...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error en compilacion
    pause
    exit /b 1
)

echo.
echo Paso 4: Verificando archivos...
if exist dist\main.js (
    echo ✅ main.js generado correctamente
) else (
    echo ❌ main.js no se genero
    pause
    exit /b 1
)

echo.
echo =============================================
echo    BACKEND LISTO PARA EJECUTAR
echo =============================================
echo.
echo Para iniciar el servidor:
echo   npm run start:dev
echo.
echo El backend estara disponible en:
echo   http://localhost:3000
echo.
echo Documentacion API:
echo   http://localhost:3000/api/docs
echo.
echo Asegurate de que MongoDB este ejecutandose antes de iniciar
echo.

pause
