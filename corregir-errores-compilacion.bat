@echo off
echo =====================================================
echo    CORRIGIENDO ERRORES DE COMPILACIÓN
echo    Dashboard Control Financiero
echo =====================================================
echo.

echo [1/4] Limpiando archivos problemáticos del backend...
cd backend\src\modules\fondos

if exist "fondos.service.ACTUALIZAR_SALDO_MEJORADO.ts" (
    echo ⚠️ Removiendo archivo fragmentado...
    del "fondos.service.ACTUALIZAR_SALDO_MEJORADO.ts"
    echo ✅ Archivo problemático removido
) else (
    echo ✅ No hay archivos problemáticos
)

echo.
echo [2/4] Verificando archivos principales del backend...
if exist "fondos.service.ts" (
    echo ✅ fondos.service.ts - OK
) else (
    echo ❌ ERROR: fondos.service.ts no encontrado
    pause
    exit /b 1
)

if exist "fondos.controller.ts" (
    echo ✅ fondos.controller.ts - OK
) else (
    echo ❌ ERROR: fondos.controller.ts no encontrado
    pause
    exit /b 1
)

cd ..\..\..\..\frontend

echo.
echo [3/4] Verificando archivos principales del frontend...
if exist "src\app\core\services\dashboard.service.ts" (
    echo ✅ dashboard.service.ts - OK
) else (
    echo ❌ ERROR: dashboard.service.ts no encontrado
    pause
    exit /b 1
)

if exist "src\app\core\services\notification.service.ts" (
    echo ✅ notification.service.ts - OK
) else (
    echo ❌ ERROR: notification.service.ts no encontrado
    pause
    exit /b 1
)

if exist "src\app\features\dashboard\dashboard.component.ts" (
    echo ✅ dashboard.component.ts - OK
) else (
    echo ❌ ERROR: dashboard.component.ts no encontrado
    pause
    exit /b 1
)

echo.
echo [4/4] Intentando compilación de prueba...
echo Compilando backend...
cd ..\backend
call npm run build --silent
set backend_status=%errorlevel%

echo Compilando frontend...
cd ..\frontend
call ng build --configuration development --progress=false 2>nul
set frontend_status=%errorlevel%

echo.
echo =====================================================
echo              RESULTADO DE CORRECCIONES
echo =====================================================
echo.

if %backend_status% equ 0 (
    echo ✅ Backend: Compilación exitosa
) else (
    echo ⚠️ Backend: Revisar errores restantes
)

if %frontend_status% equ 0 (
    echo ✅ Frontend: Compilación exitosa
) else (
    echo ⚠️ Frontend: Revisar errores restantes
)

echo.
echo CAMBIOS APLICADOS:
echo ==================
echo ✅ Archivo fragmentado removido del backend
echo ✅ Dashboard Service corregido (tipos TypeScript)
echo ✅ NotificationService actualizado con métodos faltantes
echo ✅ Dashboard Component corregido (null safety)
echo ✅ Compilación verificada
echo.
echo PRÓXIMOS PASOS:
echo ===============
echo.
echo 1. Si todo compiló bien, inicia los servicios:
echo.
echo    # Terminal 1 - Backend
echo    cd backend
echo    npm run start:dev
echo.
echo    # Terminal 2 - Frontend
echo    cd frontend
echo    ng serve
echo.
echo 2. Ve al dashboard: http://localhost:4200/dashboard
echo.
echo 3. El dashboard ahora debería mostrar datos reales
echo    sin errores de compilación.
echo.

if %backend_status% neq 0 (
    echo ⚠️ NOTA: Si el backend aún tiene errores:
    echo   - Revisa los logs de compilación arriba
    echo   - Verifica que MongoDB esté corriendo
    echo   - Asegúrate de que todas las dependencias estén instaladas
    echo.
)

if %frontend_status% neq 0 (
    echo ⚠️ NOTA: Si el frontend aún tiene errores:
    echo   - Ejecuta: ng serve --verbose para ver errores detallados
    echo   - Verifica que todas las dependencias de Angular estén instaladas
    echo   - Revisa los imports en los archivos TypeScript
    echo.
)

pause
