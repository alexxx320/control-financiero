@echo off
title Diagnóstico de Autenticación - Control Financiero
color 0B

echo ====================================
echo    DIAGNÓSTICO DE AUTENTICACIÓN
echo ====================================
echo.

echo [1] Verificando backend...
netstat -an | findstr "3000" >nul
if %errorlevel%==0 (
    echo ✓ Backend corriendo
) else (
    echo ✗ Backend NO corriendo - SOLUCIÓN: cd backend && npm run start:dev
    goto :end
)

echo.
echo [2] Probando endpoints de autenticación...
echo.

echo Probando registro...
set "email=test%random%@debug.com"
curl -s -X POST -H "Content-Type: application/json" ^
-d "{\"nombre\":\"Debug\",\"email\":\"%email%\",\"password\":\"debug123456\"}" ^
http://localhost:3000/api/auth/registro > debug_registro.json

echo Respuesta del registro:
type debug_registro.json
echo.

echo Probando login con el usuario recién creado...
curl -s -X POST -H "Content-Type: application/json" ^
-d "{\"email\":\"%email%\",\"password\":\"debug123456\"}" ^
http://localhost:3000/api/auth/login > debug_login.json

echo Respuesta del login:
type debug_login.json
echo.

echo [3] Verificando estructura de respuesta...
findstr "access_token" debug_login.json >nul
if %errorlevel%==0 (
    echo ✓ Respuesta contiene access_token
    
    findstr "usuario" debug_login.json >nul
    if %errorlevel%==0 (
        echo ✓ Respuesta contiene 'usuario' (CORRECTO)
    ) else (
        echo ✗ Respuesta NO contiene 'usuario'
        findstr "user" debug_login.json >nul
        if %errorlevel%==0 (
            echo ❌ PROBLEMA: Respuesta contiene 'user' - Backend inconsistente
        )
    )
) else (
    echo ✗ Respuesta NO contiene access_token
)

echo.
echo [4] Extrayendo token para pruebas...
for /f "tokens=2 delims=:," %%a in ('findstr "access_token" debug_login.json') do (
    set "token=%%a"
    set "token=!token:"=!"
    set "token=!token: =!"
)

if defined token (
    echo ✓ Token extraído: !token:~0,20!...
    
    echo.
    echo [5] Probando endpoints protegidos con token...
    
    echo Probando GET /api/fondos con token...
    curl -s -H "Authorization: Bearer !token!" http://localhost:3000/api/fondos > debug_fondos.json
    
    echo Respuesta de fondos:
    type debug_fondos.json
    echo.
    
    echo Probando POST /api/fondos (crear fondo) con token...
    curl -s -X POST -H "Authorization: Bearer !token!" -H "Content-Type: application/json" ^
    -d "{\"nombre\":\"Fondo Debug\",\"descripcion\":\"Test\",\"tipo\":\"ahorro\",\"metaAhorro\":100000}" ^
    http://localhost:3000/api/fondos > debug_crear_fondo.json
    
    echo Respuesta de crear fondo:
    type debug_crear_fondo.json
    echo.
    
) else (
    echo ✗ No se pudo extraer token
)

echo.
echo [6] Verificando JWT Strategy del backend...
echo.
echo Si los endpoints protegidos dieron error 401, el problema puede ser:
echo 1. JWT Strategy no está configurado correctamente
echo 2. GetUser decorator no funciona
echo 3. Token no se está validando bien
echo.

echo [7] Limpiando archivos de debug...
del debug_registro.json 2>nul
del debug_login.json 2>nul
del debug_fondos.json 2>nul
del debug_crear_fondo.json 2>nul

:end
echo.
echo ====================================
echo           DIAGNÓSTICO COMPLETO
echo ====================================
echo.
echo Si todo funcionó correctamente:
echo ✓ El backend de auth está bien
echo ✓ Los tokens son válidos
echo ✓ Los endpoints protegidos responden
echo.
echo Si hay errores 401 en fondos:
echo ❌ Problema en JWT Strategy o GetUser decorator
echo ❌ El token no se está enviando correctamente
echo ❌ El backend no reconoce el token
echo.
echo SIGUIENTE: Prueba en el frontend con la consola abierta
echo para ver exactamente qué token se está enviando.
echo.

pause
