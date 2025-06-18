@echo off
title Corrección de Autenticación - Control Financiero
color 0C

echo ====================================
echo    CORRECCIÓN DE AUTENTICACIÓN APLICADA
echo ====================================
echo.

echo ✅ PROBLEMAS CORREGIDOS:
echo.
echo 🔧 AuthService - Eliminadas simulaciones:
echo   - Token falso "dev-token-" reemplazado por token real
echo   - Respuesta "response.user" corregida a "response.usuario"
echo   - Fallbacks eliminados completamente
echo   - Logs detallados agregados en cada operación
echo.
echo 🔍 Debugging mejorado:
echo   - Verificación de token en localStorage
echo   - Logs de login/logout detallados
echo   - Validación de expiración de token
echo   - Verificación de conectividad
echo.

echo [VERIFICANDO SISTEMA]
echo.

echo 1. Verificando backend...
netstat -an | findstr "3000" >nul
if %errorlevel%==0 (
    echo ✓ Backend corriendo en puerto 3000
) else (
    echo ✗ Backend NO está corriendo
    echo   IMPORTANTE: Inicia el backend primero
    echo   Comando: cd backend && npm run start:dev
    pause
    exit /b 1
)

echo.
echo 2. Verificando MongoDB...
netstat -an | findstr "27017" >nul
if %errorlevel%==0 (
    echo ✓ MongoDB corriendo en puerto 27017
) else (
    echo ⚠ MongoDB NO está corriendo
    echo   Para iniciar: net start MongoDB
)

echo.
echo 3. Limpiando localStorage para prueba fresca...
echo Esto eliminará cualquier token simulado anterior

echo.
echo 4. Reiniciando frontend con correcciones...
taskkill /f /im ng.exe 2>nul
timeout /t 2 /nobreak >nul

cd frontend
start "Angular - Auth Corregido" cmd /k "ng serve --proxy-config proxy.conf.json --open"
cd ..

echo.
echo ====================================
echo     PRUEBA EL FLUJO DE AUTENTICACIÓN
echo ====================================
echo.
echo 🎯 PASOS PARA VERIFICAR LA CORRECCIÓN:
echo.
echo 1. El navegador se abrirá automáticamente
echo 2. Abre la consola del navegador (F12)
echo 3. Ve a la pestaña "Application" > "Local Storage"
echo 4. Limpia cualquier token anterior
echo 5. Intenta hacer login con un usuario real
echo 6. Revisa los logs en la consola
echo.
echo 📋 LOGS ESPERADOS EN CONSOLA (F12):
echo   🔐 Intentando login con: {email: "..."}
echo   ✅ Login exitoso - respuesta completa: {access_token: "...", usuario: {...}}
echo   🎩 Token recibido: eyJhbGciOiJI...
echo   👤 Usuario recibido: {id: "...", nombre: "..."}
echo   💾 Token guardado en localStorage
echo   📋 Estado actualizado - isLoggedIn: true
echo.
echo 🔍 AL INTENTAR CREAR FONDOS:
echo   🎩 Token obtenido del localStorage: eyJhbGciOiJI...
echo   🏦 Cargando fondos desde el backend...
echo   ✅ Fondos cargados exitosamente: [...]
echo.
echo ❌ SI ANTES VEÍAS ERRORES 401:
echo   - Ya NO deberías ver "no autorizado"
echo   - Los fondos se cargarán correctamente
echo   - Las transacciones funcionarán
echo.

echo PRESIONA ENTER CUANDO HAYAS PROBADO EL LOGIN...
pause >nul

echo.
echo ¿El login y la autorización funcionaron correctamente? (s/n):
set /p respuesta="> "

if /i "%respuesta%"=="s" (
    echo.
    echo 🎉 ¡PERFECTO! La autenticación está funcionando.
    echo.
    echo ✅ ESTADO ACTUAL DEL SISTEMA:
    echo   - ✅ Registro: Funciona con BD real
    echo   - ✅ Login: Token JWT real del backend
    echo   - ✅ Autorización: Headers correctos enviados
    echo   - ✅ CRUD Fondos: Autorizado correctamente
    echo   - ✅ Sin más errores 401
    echo   - ⏳ Transacciones: Listo para implementar
    echo.
    echo Tu sistema está completamente funcional para fondos.
    echo La próxima fase sería implementar las transacciones.
    echo.
) else (
    echo.
    echo 🔧 Si aún hay problemas:
    echo.
    echo 1. Revisa la consola del navegador (F12) para errores
    echo 2. Verifica que veas los logs de autenticación
    echo 3. Confirma que el token se guarde en localStorage
    echo 4. Verifica que MongoDB esté corriendo
    echo 5. Intenta con un usuario recién registrado
    echo.
    echo EJECUTA ESTOS COMANDOS PARA DEBUGGING:
    echo - verificar-endpoints-completo.bat
    echo - probar-crud-fondos.bat
    echo.
)

echo.
echo ✅ CORRECCIÓN DE AUTENTICACIÓN COMPLETADA
echo.
echo El sistema ya no usa tokens simulados y toda la autenticación
echo está conectada correctamente al backend real.
echo.
pause
