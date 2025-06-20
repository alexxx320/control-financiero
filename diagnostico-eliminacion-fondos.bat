@echo off
setlocal enabledelayedexpansion
title APLICAR ELIMINACIÓN COMPLETA
echo ================================================
echo   APLICANDO ELIMINACIÓN COMPLETA DE FONDOS
echo ================================================

echo.
echo 🎯 Esta corrección implementa:
echo   ✅ Eliminación física completa del fondo
echo   ✅ Eliminación automática de transacciones asociadas
echo   ✅ Operación irreversible (sin soft delete)
echo   ✅ Logs detallados para debugging
echo.

echo 📋 PASO 1: Aplicando correcciones en el backend...
echo ==================================================

if exist "backend\src\modules\fondos\fondos.service.CORREGIDO.ts" (
    echo 🔄 Aplicando servicio corregido...
    
    :: Crear backup
    copy "backend\src\modules\fondos\fondos.service.ts" "backend\src\modules\fondos\fondos.service.BACKUP.ts" > nul 2>&1
    if !errorlevel!==0 (
        echo ✅ Backup del servicio creado
    )
    
    :: Aplicar corrección
    copy "backend\src\modules\fondos\fondos.service.CORREGIDO.ts" "backend\src\modules\fondos\fondos.service.ts" > nul
    if !errorlevel!==0 (
        echo ✅ Servicio de fondos corregido aplicado
    ) else (
        echo ❌ Error aplicando servicio corregido
        goto error_exit
    )
) else (
    echo ❌ Archivo fondos.service.CORREGIDO.ts no encontrado
    goto error_exit
)

if exist "backend\src\modules\fondos\fondos.controller.CORREGIDO.ts" (
    echo 🔄 Aplicando controlador corregido...
    
    :: Crear backup
    copy "backend\src\modules\fondos\fondos.controller.ts" "backend\src\modules\fondos\fondos.controller.BACKUP.ts" > nul 2>&1
    
    :: Aplicar corrección
    copy "backend\src\modules\fondos\fondos.controller.CORREGIDO.ts" "backend\src\modules\fondos\fondos.controller.ts" > nul
    if !errorlevel!==0 (
        echo ✅ Controlador de fondos corregido aplicado
    )
)

echo.
echo 📋 PASO 2: Aplicando correcciones en el frontend...
echo ===================================================

if exist "frontend\src\app\core\services\fondo.service.MEJORADO.ts" (
    echo 🔄 Aplicando servicio frontend mejorado...
    
    :: Crear backup
    copy "frontend\src\app\core\services\fondo.service.ts" "frontend\src\app\core\services\fondo.service.BACKUP.ts" > nul 2>&1
    
    :: Aplicar mejora
    copy "frontend\src\app\core\services\fondo.service.MEJORADO.ts" "frontend\src\app\core\services\fondo.service.ts" > nul
    if !errorlevel!==0 (
        echo ✅ Servicio frontend mejorado aplicado
    )
)

echo.
echo 📋 PASO 3: Verificando servicios...
echo ====================================

echo Verificando backend...
curl -s http://localhost:3000/health > nul 2>&1
if !errorlevel!==0 (
    echo ✅ Backend ejecutándose
) else (
    echo ⚠️  Backend no está ejecutándose
    echo 💡 Para aplicar los cambios, reinicia el backend:
    echo    Ctrl+C en la terminal del backend
    echo    cd backend
    echo    npm run start:dev
)

echo.
echo 📋 PASO 4: Probando eliminación completa...
echo ==============================================
echo Ejecutando prueba de eliminación completa...
node test-eliminacion-completa.js

echo.
echo 📋 PASO 5: Instrucciones finales...
echo ====================================
echo.
echo ✅ CORRECCIONES APLICADAS:
echo   📁 Backend: Eliminación física + transacciones
echo   💻 Frontend: Servicio con debugging mejorado
echo   🧪 Test: Prueba de eliminación completa
echo.
echo 🔄 PARA APLICAR LOS CAMBIOS:
echo.
echo 1. REINICIAR BACKEND (si está ejecutándose):
echo    - Presiona Ctrl+C en la terminal del backend
echo    - cd backend
echo    - npm run start:dev
echo.
echo 2. REINICIAR FRONTEND (si está ejecutándose):
echo    - Presiona Ctrl+C en la terminal del frontend
echo    - cd frontend  
echo    - ng serve
echo.
echo 3. PROBAR DESDE EL NAVEGADOR:
echo    - Ve a http://localhost:4200
echo    - Inicia sesión
echo    - Ve a "Fondos"
echo    - Crea un fondo
echo    - Agrega algunas transacciones al fondo
echo    - Abre F12 > Console
echo    - Elimina el fondo
echo    - Verifica que tanto el fondo como las transacciones se eliminaron
echo.
echo 📊 LOGS ESPERADOS EN CONSOLA:
echo   🗑️ "Backend - Iniciando eliminación COMPLETA del fondo"
echo   📊 "Transacciones asociadas encontradas: X"
echo   🔥 "Eliminando X transacciones asociadas..."
echo   ✅ "Transacciones eliminadas: X"
echo   🔥 "Eliminando fondo de la base de datos..."
echo   ✅ "Eliminación COMPLETA exitosa"
echo.
echo 🎉 LA ELIMINACIÓN AHORA ES COMPLETAMENTE FÍSICA!
echo    (Fondo + Transacciones eliminados permanentemente)
echo.
goto end

:error_exit
echo.
echo ❌ ERROR: No se pudieron aplicar todas las correcciones
echo 💡 Asegúrate de ejecutar este script desde la raíz del proyecto
echo.
pause
exit /b 1

:end
pause
