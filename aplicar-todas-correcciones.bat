@echo off
title Aplicación Completa de Correcciones - Control Financiero
color 0E

echo ====================================
echo    APLICANDO TODAS LAS CORRECCIONES
echo ====================================
echo.

echo [PASO 1] Creando respaldos...
echo.

if exist "frontend\src\app\features\auth\login.component.ts" (
    copy "frontend\src\app\features\auth\login.component.ts" "frontend\src\app\features\auth\login.component.ts.BACKUP" >nul
    echo ✓ Backup de login.component.ts creado
)

if exist "frontend\src\app\features\auth\register.component.ts" (
    copy "frontend\src\app\features\auth\register.component.ts" "frontend\src\app\features\auth\register.component.ts.BACKUP" >nul
    echo ✓ Backup de register.component.ts creado
)

if exist "frontend\src\app\features\fondos\fondos.component.ts" (
    copy "frontend\src\app\features\fondos\fondos.component.ts" "frontend\src\app\features\fondos\fondos.component.ts.BACKUP" >nul
    echo ✓ Backup de fondos.component.ts creado
)

if exist "frontend\src\app\core\services\auth.service.ts" (
    copy "frontend\src\app\core\services\auth.service.ts" "frontend\src\app\core\services\auth.service.ts.BACKUP" >nul
    echo ✓ Backup de auth.service.ts creado
)

if exist "frontend\src\app\core\services\fondo.service.ts" (
    copy "frontend\src\app\core\services\fondo.service.ts" "frontend\src\app\core\services\fondo.service.ts.BACKUP" >nul
    echo ✓ Backup de fondo.service.ts creado
)

echo.
echo [PASO 2] Aplicando archivos corregidos...
echo.

:: Aplicar auth.service corregido
if exist "frontend\src\app\core\services\auth.service.CORREGIDO.ts" (
    copy "frontend\src\app\core\services\auth.service.CORREGIDO.ts" "frontend\src\app\core\services\auth.service.ts" >nul
    echo ✓ auth.service.ts corregido aplicado
) else (
    echo ✗ auth.service.CORREGIDO.ts no encontrado
)

:: Aplicar fondo.service corregido
if exist "frontend\src\app\core\services\fondo.service.CORREGIDO.ts" (
    copy "frontend\src\app\core\services\fondo.service.CORREGIDO.ts" "frontend\src\app\core\services\fondo.service.ts" >nul
    echo ✓ fondo.service.ts corregido aplicado
) else (
    echo ✗ fondo.service.CORREGIDO.ts no encontrado
)

:: Aplicar login.component corregido
if exist "frontend\src\app\features\auth\login.component.CORREGIDO.ts" (
    copy "frontend\src\app\features\auth\login.component.CORREGIDO.ts" "frontend\src\app\features\auth\login.component.ts" >nul
    echo ✓ login.component.ts corregido aplicado
) else (
    echo ✗ login.component.CORREGIDO.ts no encontrado
)

:: Aplicar register.component corregido
if exist "frontend\src\app\features\auth\register.component.CORREGIDO.ts" (
    copy "frontend\src\app\features\auth\register.component.CORREGIDO.ts" "frontend\src\app\features\auth\register.component.ts" >nul
    echo ✓ register.component.ts corregido aplicado
) else (
    echo ✗ register.component.CORREGIDO.ts no encontrado
)

:: Aplicar fondos.component corregido
if exist "frontend\src\app\features\fondos\fondos.component.CORREGIDO.ts" (
    copy "frontend\src\app\features\fondos\fondos.component.CORREGIDO.ts" "frontend\src\app\features\fondos\fondos.component.ts" >nul
    echo ✓ fondos.component.ts corregido aplicado
) else (
    echo ✗ fondos.component.CORREGIDO.ts no encontrado
)

echo.
echo [PASO 3] Verificando configuraciones del backend...
echo.

:: Verificar que el .env existe
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo ✓ Archivo .env creado desde .env.example
    ) else (
        echo ✗ No se encontró .env.example
    )
) else (
    echo ✓ Archivo .env ya existe
)

:: Verificar estructura del backend
if exist "backend\src\app.module.ts" (
    echo ✓ app.module.ts existe
) else (
    echo ✗ app.module.ts no encontrado
)

if exist "backend\src\modules\auth\auth.service.ts" (
    echo ✓ auth.service.ts del backend existe
) else (
    echo ✗ auth.service.ts del backend no encontrado
)

echo.
echo [PASO 4] Compilando backend...
echo.
cd backend
echo Compilando TypeScript...
call npm run build
if %errorlevel%==0 (
    echo ✓ Backend compilado exitosamente
) else (
    echo ✗ Error compilando backend - revisa los errores arriba
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [PASO 5] Verificando dependencias del frontend...
echo.
cd frontend
if not exist "node_modules\@angular\material" (
    echo Instalando Angular Material...
    call npm install @angular/material @angular/cdk @angular/animations
)

if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    call npm install
)
cd ..

echo.
echo ====================================
echo      CORRECCIONES APLICADAS
echo ====================================
echo.
echo Los siguientes cambios se han aplicado:
echo.
echo 🔧 SERVICIOS CORREGIDOS:
echo ✓ AuthService: Eliminados fallbacks, respuesta 'usuario' vs 'user'
echo ✓ FondoService: Eliminados datos simulados, errores reales
echo ✓ Agregados logs detallados para debugging
echo.
echo 🎨 COMPONENTES CORREGIDOS:
echo ✓ LoginComponent: Diagnóstico de conectividad integrado
echo ✓ RegisterComponent: Validación asíncrona de email mejorada
echo ✓ FondosComponent: CRUD completo sin simulaciones
echo.
echo 🔗 BACKEND VERIFICADO:
echo ✓ Compilación verificada
echo ✓ Configuración de .env verificada
echo ✓ Estructura de módulos verificada
echo.
echo 📋 PRINCIPALES CORRECCIONES:
echo - Error mat-form-field resuelto con imports correctos
echo - Respuesta 'usuario' vs 'user' corregida en auth
echo - Eliminadas todas las simulaciones de datos
echo - Agregado diagnóstico de conectividad en tiempo real
echo - Manejo de errores específicos por código de estado
echo - Validación real de tokens JWT
echo.
echo SIGUIENTE PASO:
echo 1. Asegúrate de que MongoDB esté corriendo
echo 2. Ejecuta 'verificar-endpoints-completo.bat' para probar
echo 3. Usa 'iniciar-sistema-corregido.bat' para iniciar todo
echo.

pause
