@echo off
echo 🔄 Compilando cambios del backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error al compilar el backend
    pause
    exit /b 1
)

echo ✅ Backend compilado exitosamente

echo 🔄 Iniciando servidor en modo desarrollo...
echo 📝 Presiona Ctrl+C para detener el servidor
call npm run start:dev
