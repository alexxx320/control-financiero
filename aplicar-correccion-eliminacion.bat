@echo off
title APLICAR CORRECCIÓN: Eliminación de Fondos
echo ============================================
echo   APLICANDO CORRECCIÓN DE ELIMINACIÓN
echo ============================================

echo.
echo 🔧 Aplicando servicio mejorado para eliminación de fondos...

if exist "frontend\src\app\core\services\fondo.service.MEJORADO.ts" (
    echo ✅ Archivo mejorado encontrado
    
    echo 📋 Creando backup del archivo actual...
    copy "frontend\src\app\core\services\fondo.service.ts" "frontend\src\app\core\services\fondo.service.BACKUP.ts" > nul 2>&1
    if !errorlevel!==0 (
        echo ✅ Backup creado: fondo.service.BACKUP.ts
    ) else (
        echo ⚠️  No se pudo crear backup
    )
    
    echo 🔄 Aplicando versión mejorada...
    copy "frontend\src\app\core\services\fondo.service.MEJORADO.ts" "frontend\src\app\core\services\fondo.service.ts" > nul
    if !errorlevel!==0 (
        echo ✅ Servicio actualizado exitosamente
        echo.
        echo 📊 MEJORAS APLICADAS:
        echo   ✅ Logging detallado para debugging
        echo   ✅ Mejor manejo de errores HTTP
        echo   ✅ Validación de token antes de peticiones
        echo   ✅ Logs informativos en cada paso
        echo   ✅ Actualización automática de lista local
        echo.
        echo 🎯 PRÓXIMOS PASOS:
        echo 1. Si el frontend está ejecutándose, reinícialo:
        echo    Ctrl+C en la terminal de frontend
        echo    ng serve
        echo.
        echo 2. Prueba la eliminación desde el navegador:
        echo    - Ve a http://localhost:4200
        echo    - Inicia sesión
        echo    - Ve a "Fondos"
        echo    - Abre F12 ^> Console
        echo    - Intenta eliminar un fondo
        echo    - Revisa los logs detallados
        echo.
        echo 3. Los logs deberían mostrar:
        echo    🗑️ "FondoService - Iniciando eliminación de fondo"
        echo    ✅ "FondoService - Fondo eliminado exitosamente"
        echo.
    ) else (
        echo ❌ Error aplicando la corrección
    )
) else (
    echo ❌ Archivo mejorado no encontrado
    echo 💡 Ejecuta primero: diagnostico-eliminacion-fondos.bat
)

echo.
echo ============================================
echo   CORRECCIÓN APLICADA
echo ============================================
pause
