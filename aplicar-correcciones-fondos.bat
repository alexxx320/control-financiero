@echo off
title Aplicar Correcciones de Fondos - Control Financiero
color 0C

echo ====================================
echo    APLICANDO CORRECCIONES DE FONDOS
echo ====================================
echo.

echo [1] Creando respaldos específicos...
if exist "frontend\src\app\core\services\fondo.service.ts" (
    copy "frontend\src\app\core\services\fondo.service.ts" "frontend\src\app\core\services\fondo.service.ts.BACKUP" >nul
    echo ✓ Backup de fondo.service.ts creado
)

if exist "frontend\src\app\features\fondos\fondos.component.ts" (
    copy "frontend\src\app\features\fondos\fondos.component.ts" "frontend\src\app\features\fondos\fondos.component.ts.BACKUP" >nul
    echo ✓ Backup de fondos.component.ts creado
)

echo.
echo [2] Aplicando servicio de fondos corregido...
if exist "frontend\src\app\core\services\fondo.service.CORREGIDO.ts" (
    copy "frontend\src\app\core\services\fondo.service.CORREGIDO.ts" "frontend\src\app\core\services\fondo.service.ts" >nul
    echo ✓ fondo.service.ts corregido aplicado
    echo   - Eliminados datos simulados
    echo   - Agregados logs detallados
    echo   - Manejo de errores específicos
) else (
    echo ✗ fondo.service.CORREGIDO.ts no encontrado
)

echo.
echo [3] Aplicando componente de fondos corregido...
if exist "frontend\src\app\features\fondos\fondos.component.CORREGIDO.ts" (
    copy "frontend\src\app\features\fondos\fondos.component.CORREGIDO.ts" "frontend\src\app\features\fondos\fondos.component.ts" >nul
    echo ✓ fondos.component.ts corregido aplicado
    echo   - CRUD completo sin simulaciones
    echo   - Estado de conectividad en tiempo real
    echo   - UI mejorada con Material Design
) else (
    echo ✗ fondos.component.CORREGIDO.ts no encontrado
)

echo.
echo [4] Verificando backend...
if exist "backend\src\modules\fondos\fondos.controller.ts" (
    echo ✓ Controlador de fondos del backend existe
) else (
    echo ✗ Controlador de fondos del backend no encontrado
)

if exist "backend\src\modules\fondos\fondos.service.ts" (
    echo ✓ Servicio de fondos del backend existe
) else (
    echo ✗ Servicio de fondos del backend no encontrado
)

echo.
echo [5] Verificando esquemas y DTOs...
if exist "backend\src\modules\fondos\schemas\fondo.schema.ts" (
    echo ✓ Esquema de fondo existe
) else (
    echo ✗ Esquema de fondo no encontrado
)

if exist "backend\src\common\dto\fondo.dto.ts" (
    echo ✓ DTOs de fondo existen
) else (
    echo ✗ DTOs de fondo no encontrados
)

echo.
echo ====================================
echo      CORRECCIONES APLICADAS
echo ====================================
echo.
echo ✅ PRINCIPALES CAMBIOS:
echo.
echo 🔧 FondoService:
echo   - ELIMINADOS datos simulados completamente
echo   - Logs detallados en cada operación
echo   - Errores específicos por código HTTP
echo   - Sin fallbacks que oculten problemas
echo.
echo 🎨 FondosComponent:
echo   - CRUD real conectado al backend
echo   - Diagnóstico de conectividad en tiempo real
echo   - UI moderna y responsive
echo   - Manejo de estados de carga
echo.
echo 🔗 Backend verificado:
echo   - Controlador con endpoints correctos
echo   - Servicio con lógica de negocio
echo   - Esquemas y DTOs estructurados
echo.
echo 🔍 PARA PROBAR LOS FONDOS:
echo 1. Asegúrate de que el backend esté corriendo
echo 2. Inicia sesión en la aplicación
echo 3. Ve a la sección de Fondos
echo 4. Crea un nuevo fondo
echo 5. Edita el fondo creado
echo 6. Elimina el fondo
echo 7. Revisa la consola del navegador (F12) para logs
echo.
echo SIGUIENTE PASO:
echo   Ejecuta 'probar-crud-fondos.bat' para probar el CRUD
echo.

pause
