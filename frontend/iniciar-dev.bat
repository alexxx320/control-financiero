@echo off
cls
echo ===============================================
echo     CONTROL FINANCIERO - FRONTEND ANGULAR
echo ===============================================
echo.

echo [1/3] Verificando dependencias...
if not exist "node_modules" (
    echo.
    echo ❌ Dependencias no encontradas
    echo 📦 Instalando dependencias de npm...
    echo.
    call npm install --silent
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Error al instalar dependencias
        echo 💡 Intenta ejecutar manualmente: npm install
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas correctamente
) else (
    echo ✅ Dependencias encontradas
)

echo.
echo [2/3] Verificando configuración...
if not exist "src\main.ts" (
    echo ❌ Archivo main.ts no encontrado
    pause
    exit /b 1
)
echo ✅ Configuración verificada

echo.
echo [3/3] Iniciando servidor de desarrollo...
echo.
echo 🌐 La aplicación estará disponible en: 
echo    👉 http://localhost:4200
echo.
echo ⚠️  Asegúrate de que el backend esté ejecutándose en puerto 3000
echo.
echo 🔄 Iniciando Angular Dev Server...
echo 📝 Presiona Ctrl+C para detener el servidor
echo.

start http://localhost:4200

call npm start
