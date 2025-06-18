@echo off
cls
echo ===============================================
echo          VERIFICACION RAPIDA - FRONTEND
echo ===============================================
echo.

echo [1/4] Limpiando instalacion anterior...
if exist "node_modules" (
    echo Eliminando node_modules...
    rmdir /s /q "node_modules" 2>nul
)
if exist "package-lock.json" (
    echo Eliminando package-lock.json...
    del "package-lock.json" 2>nul
)

echo.
echo [2/4] Instalando dependencias (esto puede tomar unos minutos)...
call npm install --silent

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error en la instalacion
    echo 💡 Revisa que tengas Node.js instalado
    pause
    exit /b 1
)

echo.
echo [3/4] Verificando compilacion...
call npm run build 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error de compilacion detectado
    echo 🔧 Iniciando servidor en modo desarrollo para ver errores...
    echo.
    call npm start
) else (
    echo ✅ Compilacion exitosa
    echo.
    echo [4/4] Iniciando servidor de desarrollo...
    echo 🌐 Abriendo en: http://localhost:4200
    echo.
    start http://localhost:4200
    call npm start
)
