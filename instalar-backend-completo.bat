@echo off
echo =============================================
echo    INSTALACION COMPLETA - CONTROL FINANCIERO
echo    CON SISTEMA DE AUTENTICACION
echo =============================================
echo.

cd /d "%~dp0backend"

echo Paso 1: Instalando herramientas globales...
call npm install -g typescript@5.2.2
call npm install -g @nestjs/cli@10.2.1

echo.
echo Paso 2: Instalando dependencias del proyecto (incluyendo autenticacion)...
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
echo    SISTEMA COMPLETO INSTALADO
echo =============================================
echo.
echo 🚀 FUNCIONALIDADES INCLUIDAS:
echo   ✅ Autenticacion JWT completa
echo   ✅ Registro y login de usuarios
echo   ✅ Gestion de fondos por usuario
echo   ✅ Transacciones personalizadas
echo   ✅ Reportes y estadisticas
echo   ✅ Sistema de roles (admin/usuario)
echo   ✅ Seguridad y validaciones
echo.
echo 📚 ENDPOINTS PRINCIPALES:
echo   POST /auth/registro     - Registrar usuario
echo   POST /auth/login        - Iniciar sesion
echo   GET  /auth/perfil       - Ver mi perfil
echo   GET  /fondos            - Mis fondos
echo   POST /fondos            - Crear fondo
echo   GET  /transacciones     - Mis transacciones
echo   POST /transacciones     - Crear transaccion
echo   GET  /reportes/mensual  - Reporte mensual
echo.
echo 🔗 URLs IMPORTANTES:
echo   Backend: http://localhost:3000
echo   API Docs: http://localhost:3000/api/docs
echo.
echo 🗄️ BASE DE DATOS:
echo   Asegurate de que MongoDB este ejecutandose:
echo   net start MongoDB
echo.
echo 🚦 PARA INICIAR:
echo   npm run start:dev
echo.

pause
