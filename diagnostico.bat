@echo off
title Diagnóstico Control Financiero
color 0E
echo.
echo ╔════════════════════════════════════════╗
echo ║        DIAGNÓSTICO DEL SISTEMA         ║
echo ╚════════════════════════════════════════╝
echo.

echo 🔍 1. Verificando si el puerto 3000 está en uso...
netstat -an | findstr ":3000"
if errorlevel 1 (
    echo ❌ El puerto 3000 NO está siendo usado
    echo    El backend NO está ejecutándose
) else (
    echo ✅ El puerto 3000 está siendo usado
    echo    El backend parece estar ejecutándose
)
echo.

echo 🔍 2. Verificando procesos Node.js...
tasklist | findstr node.exe
echo.

echo 🔍 3. Intentando conectar a localhost:3000...
ping -n 1 localhost >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Localhost responde
) else (
    echo ❌ Problema con localhost
)
echo.

echo 🔍 4. Verificando URLs del backend...
echo.
echo 📡 Probando http://localhost:3000/ ...
curl -s -m 5 -o nul -w "HTTP Status: %%{http_code} | Tiempo: %%{time_total}s\n" http://localhost:3000/ 2>nul
if errorlevel 1 echo ❌ No se pudo conectar o curl no disponible

echo 📡 Probando http://localhost:3000/health ...
curl -s -m 5 -o nul -w "HTTP Status: %%{http_code} | Tiempo: %%{time_total}s\n" http://localhost:3000/health 2>nul
if errorlevel 1 echo ❌ No se pudo conectar o curl no disponible

echo.
echo 🔍 5. Verificando respuesta del servidor...
echo Respuesta de /health:
curl -s -m 5 http://localhost:3000/health 2>nul
echo.
echo.

echo 🔍 6. Verificando configuración de red...
ipconfig | findstr "IPv4"
echo.

echo ╔════════════════════════════════════════╗
echo ║              RESUMEN                   ║
echo ╚════════════════════════════════════════╝
echo.
echo Si ves errores arriba:
echo 1. ❌ Puerto 3000 no usado = Backend no iniciado
echo 2. ❌ HTTP Status 000 = Backend no responde
echo 3. ❌ No respuesta JSON = Backend mal configurado
echo.
echo Soluciones:
echo 1. Inicia el backend: cd backend ^&^& npm run start:dev
echo 2. Verifica la consola del backend por errores
echo 3. Verifica que MongoDB esté disponible
echo.
pause
