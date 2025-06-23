@echo off
echo 🔧 Reparando dependencias del backend...

echo 📁 Limpiando archivos de lock...
if exist package-lock.json del package-lock.json
if exist npm-shrinkwrap.json del npm-shrinkwrap.json

echo 🧹 Limpiando cache de npm...
npm cache clean --force

echo 📦 Limpiando node_modules...
if exist node_modules rmdir /s /q node_modules

echo ⬇️ Reinstalando dependencias...
npm install

echo 🏗️ Verificando build...
npm run build

echo ✅ ¡Dependencias reparadas! Ahora puedes hacer deploy en Railway.
pause
