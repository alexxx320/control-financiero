@echo off
echo =============================================
echo    COMPILANDO BACKEND CORREGIDO
echo =============================================
echo.

cd /d "%~dp0backend"

echo Limpiando compilacion anterior...
if exist dist rmdir /s /q dist

echo.
echo Compilando proyecto...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ COMPILACION EXITOSA!
    echo.
    if exist dist\main.js (
        echo ✅ main.js generado correctamente
        echo.
        echo Para iniciar el servidor:
        echo   npm run start:dev
        echo.
        echo Backend estara disponible en: http://localhost:3000
        echo API Docs: http://localhost:3000/api/docs
        echo.
    ) else (
        echo ❌ main.js no se genero
    )
) else (
    echo.
    echo ❌ ERROR EN COMPILACION
    echo Revisa los errores mostrados arriba
)

echo.
pause
