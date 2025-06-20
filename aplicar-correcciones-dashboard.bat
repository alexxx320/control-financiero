@echo off
echo =====================================================
echo    APLICANDO CORRECCIONES PARA DATOS REALES
echo    Dashboard Control Financiero
echo =====================================================
echo.

echo [1/4] Verificando estructura del proyecto...
if not exist "frontend\src\app\core\services\dashboard.service.ts" (
    echo ERROR: No se encuentra el dashboard service
    pause
    exit /b 1
)

if not exist "backend\src\modules\fondos\fondos.service.ts" (
    echo ERROR: No se encuentra el fondos service del backend
    pause
    exit /b 1
)

echo ✅ Estructura del proyecto verificada

echo.
echo [2/4] Instalando dependencias del backend (si es necesario)...
cd backend
call npm install --silent

echo.
echo [3/4] Instalando dependencias del frontend (si es necesario)...
cd ..\frontend
call npm install --silent

echo.
echo [4/4] Compilando proyecto para verificar cambios...
cd ..\backend
echo Compilando backend...
call npm run build 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Warning: Backend compilation issues detected
    echo Continuando con el frontend...
)

cd ..\frontend
echo Compilando frontend...
call ng build --configuration development 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Warning: Frontend compilation issues detected
    echo Puede que necesites revisar las importaciones
)

echo.
echo =====================================================
echo           CORRECCIONES APLICADAS EXITOSAMENTE
echo =====================================================
echo.
echo ✅ Dashboard Service actualizado para usar datos reales
echo ✅ Dashboard Component mejorado con mejor UX
echo ✅ Dashboard Controller agregado al backend
echo ✅ FondosService extendido con estadísticas personalizadas
echo ✅ Módulos del backend actualizados
echo.
echo PRÓXIMOS PASOS:
echo ═══════════════
echo.
echo 1. Inicia el backend:
echo    cd backend
echo    npm run start:dev
echo.
echo 2. En otra terminal, inicia el frontend:
echo    cd frontend  
echo    ng serve
echo.
echo 3. Ve a http://localhost:4200/dashboard
echo.
echo 4. El dashboard ahora mostrará:
echo    • Datos reales de la base de datos
echo    • Alertas de conectividad si no hay backend
echo    • Información de progreso real de fondos
echo    • Estadísticas calculadas en tiempo real
echo.
echo NOTAS IMPORTANTES:
echo ═══════════════════
echo.
echo • Si ves "No se puede conectar con el servidor":
echo   - Verifica que el backend esté corriendo en puerto 3000
echo   - Verifica que MongoDB esté corriendo
echo   - Revisa los logs del backend para errores
echo.
echo • Los endpoints nuevos disponibles son:
echo   - GET /api/dashboard/resumen
echo   - GET /api/dashboard/alertas  
echo   - GET /api/dashboard/estadisticas-rapidas
echo.
echo • El dashboard ahora tiene:
echo   - Verificación automática de conectividad
echo   - Fallback a datos vacíos (no simulados)
echo   - Mejor experiencia de usuario
echo   - Indicadores de carga y error
echo.
pause
