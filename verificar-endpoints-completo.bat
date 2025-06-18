@echo off
title Verificación Completa de Endpoints - Control Financiero
color 0F

echo ====================================
echo    VERIFICACIÓN DE ENDPOINTS
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

echo [2] Probando endpoints de autenticación...
echo.

echo Probando health check...
curl -s -o nul -w "%%{http_code}" http://localhost:3000/health
echo  - Health check

echo Probando health check detallado...
curl -s -o nul -w "%%{http_code}" http://localhost:3000/
echo  - Root endpoint

echo.
echo Probando endpoint de registro (debería dar 400 - datos faltantes)...
curl -s -o nul -w "%%{http_code}" -X POST -H "Content-Type: application/json" -d "{}" http://localhost:3000/api/auth/registro
echo  - POST /api/auth/registro (sin datos)

echo.
echo Probando endpoint de login (debería dar 400 - datos faltantes)...
curl -s -o nul -w "%%{http_code}" -X POST -H "Content-Type: application/json" -d "{}" http://localhost:3000/api/auth/login
echo  - POST /api/auth/login (sin datos)

echo.
echo Probando endpoint de fondos sin autenticación (debería dar 401)...
curl -s -o nul -w "%%{http_code}" http://localhost:3000/api/fondos
echo  - GET /api/fondos (sin token)

echo.
echo [3] Probando registro real...
echo.
set "email=test_%random%@ejemplo.com"
echo Registrando usuario con email: %email%

curl -s -X POST -H "Content-Type: application/json" ^
-d "{\"nombre\":\"Usuario Test\",\"apellido\":\"Prueba\",\"email\":\"%email%\",\"password\":\"test123456\"}" ^
http://localhost:3000/api/auth/registro > registro_response.json

if %errorlevel%==0 (
    echo ✓ Registro ejecutado - Revisa registro_response.json
    type registro_response.json
) else (
    echo ✗ Error en registro
)

echo.
echo [4] Probando login con credenciales...
echo.
echo Intentando login con usuario existente...
curl -s -X POST -H "Content-Type: application/json" ^
-d "{\"email\":\"%email%\",\"password\":\"test123456\"}" ^
http://localhost:3000/api/auth/login > login_response.json

if %errorlevel%==0 (
    echo ✓ Login ejecutado - Revisa login_response.json
    type login_response.json
) else (
    echo ✗ Error en login
)

echo.
echo [5] Verificando estructura de respuestas...
echo.
echo Verificando que las respuestas tengan el formato correcto:
findstr "usuario" login_response.json >nul
if %errorlevel%==0 (
    echo ✓ La respuesta contiene 'usuario' (correcto)
) else (
    echo ✗ La respuesta NO contiene 'usuario'
    findstr "user" login_response.json >nul
    if %errorlevel%==0 (
        echo ⚠ La respuesta contiene 'user' - NECESITA CORRECCIÓN
    )
)

findstr "access_token" login_response.json >nul
if %errorlevel%==0 (
    echo ✓ La respuesta contiene 'access_token'
) else (
    echo ✗ La respuesta NO contiene 'access_token'
)

echo.
echo [6] Probando MongoDB...
echo.
echo Verificando conexión a MongoDB...
netstat -an | findstr "27017" >nul
if %errorlevel%==0 (
    echo ✓ MongoDB está corriendo en puerto 27017
) else (
    echo ✗ MongoDB NO está corriendo
    echo   Ejecuta: 'net start MongoDB' o 'mongod'
)

echo.
echo [7] Limpieza...
del registro_response.json 2>nul
del login_response.json 2>nul

:end
echo ====================================
echo           RESUMEN
echo ====================================
echo.
echo Si todos los endpoints responden correctamente:
echo ✓ El backend está funcionando
echo ✓ Los endpoints están accesibles
echo ✓ MongoDB está conectado
echo ✓ Las respuestas tienen el formato correcto
echo.
echo Si hay errores:
echo 1. Verifica que MongoDB esté corriendo
echo 2. Verifica que el backend esté compilado y corriendo
echo 3. Revisa los logs del backend en la terminal
echo 4. Aplica las correcciones de archivos si hay problemas de formato
echo.
pause
