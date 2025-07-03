@echo off
title Control Financiero - Iniciador Principal
color 0A
echo.
echo  ╔═══════════════════════════════════════════════════╗
echo  ║             CONTROL FINANCIERO                    ║
echo  ║           Sistema de Inicio Rápido               ║
echo  ╚═══════════════════════════════════════════════════╝
echo.

echo 📍 Ubicación del proyecto: %~dp0
echo.

:menu
echo ┌─────────────────────────────────────────────────────┐
echo │                   MENU PRINCIPAL                    │
echo ├─────────────────────────────────────────────────────┤
echo │  1. 🚀 Iniciar Backend (NestJS)                    │
echo │  2. 🚀 Iniciar Frontend (Angular)                  │
echo │  3. 🚀 Iniciar Ambos (Recomendado)                 │
echo │  4. 🔧 Instalar Dependencias                       │
echo │  5. 🩺 Verificar Estado del Sistema                │
echo │  6. ❌ Salir                                        │
echo └─────────────────────────────────────────────────────┘
echo.
set /p choice="Selecciona una opción (1-6): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto both
if "%choice%"=="4" goto install
if "%choice%"=="5" goto check
if "%choice%"=="6" goto exit
echo ❌ Opción inválida. Intenta de nuevo.
echo.
goto menu

:backend
echo.
echo 🚀 Iniciando Backend...
cd backend
call start-backend.bat
goto menu

:frontend
echo.
echo 🚀 Iniciando Frontend...
cd frontend
call start-frontend.bat
goto menu

:both
echo.
echo 🚀 Iniciando Backend y Frontend...
echo.
echo ⏰ Iniciando Backend primero (espera 5 segundos)...
start cmd /k "cd backend && start-backend.bat"
timeout /t 5
echo.
echo ⏰ Iniciando Frontend...
start cmd /k "cd frontend && start-frontend.bat"
echo.
echo ✅ Ambos servicios iniciados en ventanas separadas
echo 📱 Frontend: http://localhost:4200
echo 🛡️  Backend: http://localhost:3000
echo.
pause
goto menu

:install
echo.
echo 📦 Instalando dependencias...
echo.
echo 📦 Backend...
cd backend
call npm install
echo.
echo 📦 Frontend...
cd ../frontend
call npm install
cd ..
echo.
echo ✅ Dependencias instaladas
pause
goto menu

:check
echo.
echo 🩺 Verificando estado del sistema...
echo.

REM Verificar estructura de directorios
echo 📁 Verificando estructura de directorios...
if exist "backend\src\main.ts" (echo ✅ Backend encontrado) else (echo ❌ Backend no encontrado)
if exist "frontend\src\main.ts" (echo ✅ Frontend encontrado) else (echo ❌ Frontend no encontrado)
if exist "backend\node_modules" (echo ✅ Backend deps instaladas) else (echo ⚠️  Backend deps no instaladas)
if exist "frontend\node_modules" (echo ✅ Frontend deps instaladas) else (echo ⚠️  Frontend deps no instaladas)

echo.
echo 🌐 Verificando conectividad...
ping -n 1 localhost >nul 2>&1
if %errorlevel%==0 (echo ✅ Localhost disponible) else (echo ❌ Problema con localhost)

echo.
echo 📊 URLs del sistema:
echo    Frontend: http://localhost:4200
echo    Backend:  http://localhost:3000
echo    API:      http://localhost:3000/api
echo    Auth:     http://localhost:3000/api/auth/login
echo    Docs:     http://localhost:3000/api/docs
echo    Health:   http://localhost:3000/health
echo.
pause
goto menu

:exit
echo.
echo 👋 ¡Gracias por usar Control Financiero!
echo.
exit

