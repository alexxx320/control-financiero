@echo off
echo ========================================
echo 🔍 VERIFICADOR DE CONFIGURACIÓN
echo ========================================

cd frontend

echo.
echo 1. Verificando archivos de entorno...
echo.

if exist "src\environments\environment.ts" (
    echo ✅ environment.ts encontrado
    echo Contenido:
    type "src\environments\environment.ts"
) else (
    echo ❌ environment.ts NO encontrado
)

echo.
echo ----------------------------------------
echo.

if exist "src\environments\environment.prod.ts" (
    echo ✅ environment.prod.ts encontrado
    echo Contenido:
    type "src\environments\environment.prod.ts"
) else (
    echo ❌ environment.prod.ts NO encontrado
)

echo.
echo 2. Verificando configuración de angular.json...
echo.

findstr /C:"fileReplacements" angular.json >nul
if %errorlevel%==0 (
    echo ✅ fileReplacements configurado
) else (
    echo ❌ fileReplacements NO configurado
)

echo.
echo 3. Verificando scripts en package.json...
echo.

findstr /C:"build:prod" package.json >nul
if %errorlevel%==0 (
    echo ✅ Script build:prod encontrado
) else (
    echo ❌ Script build:prod NO encontrado
)

echo.
echo ========================================
echo 🏗️ HACIENDO BUILD DE PRUEBA...
echo ========================================

call npm run build:prod

if %errorlevel%==0 (
    echo.
    echo ✅ BUILD EXITOSO!
    echo ✅ La aplicación debería funcionar en producción
    echo.
    echo 📁 Archivos generados en: dist/control-financiero-frontend
) else (
    echo.
    echo ❌ BUILD FALLÓ!
    echo ❌ Revisa los errores arriba
)

echo.
pause
