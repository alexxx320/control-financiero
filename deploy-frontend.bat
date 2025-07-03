@echo off
echo ========================================
echo 🚀 DEPLOY FRONTEND - CONTROL FINANCIERO
echo ========================================

cd frontend

echo.
echo 📦 Instalando dependencias...
call npm install

echo.
echo 🏗️ Construyendo para producción...
call npm run build:prod

echo.
echo ✅ Build completado!
echo 📁 Archivos en: dist/control-financiero-frontend

echo.
echo 🔍 Verificando archivos generados...
dir dist\control-financiero-frontend

echo.
echo ========================================
echo ✅ FRONTEND LISTO PARA DEPLOY
echo ========================================
echo.
echo Próximos pasos:
echo 1. Subir archivos de 'dist/' a tu servidor
echo 2. Configurar servidor web (nginx/apache)
echo 3. Verificar que use HTTPS en producción
echo ========================================

pause
