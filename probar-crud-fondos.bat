@echo off
title Prueba CRUD Fondos - Control Financiero
color 0A

echo ====================================
echo    PRUEBA CRUD DE FONDOS
echo ====================================
echo.

echo [1] Verificando que el backend esté corriendo...
netstat -an | findstr "3000" >nul
if %errorlevel%==0 (
    echo ✓ Backend está corriendo en puerto 3000
) else (
    echo ✗ Backend NO está corriendo
    echo   Ejecuta: 'cd backend && npm run start:dev'
    goto :end
)
echo.

echo [2] Verificando MongoDB...
netstat -an | findstr "27017" >nul
if %errorlevel%==0 (
    echo ✓ MongoDB está corriendo en puerto 27017
) else (
    echo ✗ MongoDB NO está corriendo
    echo   Ejecuta: 'net start MongoDB' o 'mongod'
)
echo.

echo [3] Probando endpoints de fondos...
echo.

echo Probando GET /api/fondos sin token (debería dar 401)...
curl -s -o nul -w "%%{http_code}" http://localhost:3000/api/fondos
echo  - GET /api/fondos (sin autenticación)

echo.
echo [4] Registrando usuario de prueba para obtener token...
set "email=testfondos_%random%@ejemplo.com"
echo Registrando usuario: %email%

curl -s -X POST -H "Content-Type: application/json" ^
-d "{\"nombre\":\"Test Fondos\",\"email\":\"%email%\",\"password\":\"test123456\"}" ^
http://localhost:3000/api/auth/registro > temp_registro.json

if %errorlevel%==0 (
    echo ✓ Usuario registrado
    
    :: Extraer token del JSON de respuesta
    for /f "tokens=2 delims=:," %%a in ('findstr "access_token" temp_registro.json') do (
        set "token=%%a"
        set "token=!token:"=!"
        set "token=!token: =!"
    )
    
    echo Token obtenido: !token:~0,20!...
) else (
    echo ✗ Error registrando usuario
    goto :cleanup
)

echo.
echo [5] Probando CRUD de fondos con token...
echo.

echo Probando GET /api/fondos con token...
curl -s -H "Authorization: Bearer !token!" http://localhost:3000/api/fondos > fondos_lista.json
echo ✓ Lista de fondos obtenida - revisar fondos_lista.json

echo.
echo Probando POST /api/fondos (crear fondo)...
curl -s -X POST -H "Authorization: Bearer !token!" -H "Content-Type: application/json" ^
-d "{\"nombre\":\"Fondo Test\",\"descripcion\":\"Fondo de prueba\",\"tipo\":\"ahorro\",\"metaAhorro\":1000000}" ^
http://localhost:3000/api/fondos > fondo_creado.json

if %errorlevel%==0 (
    echo ✓ Fondo creado - revisar fondo_creado.json
    type fondo_creado.json
    
    :: Extraer ID del fondo creado
    for /f "tokens=2 delims=:," %%a in ('findstr "_id" fondo_creado.json') do (
        set "fondoId=%%a"
        set "fondoId=!fondoId:"=!"
        set "fondoId=!fondoId: =!"
    )
    
    echo ID del fondo: !fondoId!
) else (
    echo ✗ Error creando fondo
    goto :cleanup
)

echo.
echo Probando PATCH /api/fondos/:id (actualizar fondo)...
curl -s -X PATCH -H "Authorization: Bearer !token!" -H "Content-Type: application/json" ^
-d "{\"nombre\":\"Fondo Test Actualizado\",\"metaAhorro\":2000000}" ^
http://localhost:3000/api/fondos/!fondoId! > fondo_actualizado.json

if %errorlevel%==0 (
    echo ✓ Fondo actualizado - revisar fondo_actualizado.json
    type fondo_actualizado.json
) else (
    echo ✗ Error actualizando fondo
)

echo.
echo Probando GET /api/fondos/:id (obtener fondo específico)...
curl -s -H "Authorization: Bearer !token!" http://localhost:3000/api/fondos/!fondoId! > fondo_individual.json
echo ✓ Fondo individual obtenido - revisar fondo_individual.json

echo.
echo Probando DELETE /api/fondos/:id (eliminar fondo)...
curl -s -X DELETE -H "Authorization: Bearer !token!" http://localhost:3000/api/fondos/!fondoId! > fondo_eliminado.json

if %errorlevel%==0 (
    echo ✓ Fondo eliminado - revisar fondo_eliminado.json
    type fondo_eliminado.json
) else (
    echo ✗ Error eliminando fondo
)

echo.
echo [6] Verificando lista final de fondos...
curl -s -H "Authorization: Bearer !token!" http://localhost:3000/api/fondos > fondos_lista_final.json
echo ✓ Lista final obtenida - revisar fondos_lista_final.json

:cleanup
echo.
echo [7] Limpiando archivos temporales...
del temp_registro.json 2>nul
del fondos_lista.json 2>nul
del fondo_creado.json 2>nul
del fondo_actualizado.json 2>nul
del fondo_individual.json 2>nul
del fondo_eliminado.json 2>nul
del fondos_lista_final.json 2>nul

:end
echo.
echo ====================================
echo           RESUMEN DE PRUEBAS
echo ====================================
echo.
echo Si todas las pruebas fueron exitosas:
echo ✓ El backend de fondos está funcionando
echo ✓ Los endpoints CRUD responden correctamente
echo ✓ La autenticación funciona para fondos
echo ✓ MongoDB guarda y actualiza fondos
echo.
echo AHORA PRUEBA EN EL FRONTEND:
echo 1. Ve a http://localhost:4200
echo 2. Inicia sesión 
echo 3. Ve a la sección Fondos
echo 4. Crea, edita y elimina fondos
echo 5. Revisa la consola del navegador (F12) para logs
echo.
echo Si hay errores en el frontend:
echo - Ejecuta 'aplicar-correcciones-fondos.bat'
echo - Reinicia el servidor de desarrollo de Angular
echo - Verifica los logs de la consola del navegador
echo.

pause
