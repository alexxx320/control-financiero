@echo off
echo 🔨 Compilando aplicación localmente...
cd backend
npm install
npm run build
echo ✅ Build completado en ./backend/dist

echo 🚀 Listo para deploy a Railway
echo El Dockerfile copiará el build ya compilado
