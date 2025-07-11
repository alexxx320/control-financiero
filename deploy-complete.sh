#!/bin/bash
echo "🔨 Preparando deploy completo..."

echo "📋 Verificando variables de entorno necesarias..."
echo "MONGODB_URI debe estar configurada en Railway Variables"
echo "NODE_ENV=production"
echo "PORT=3000"
echo ""

echo "🧹 Limpiando build anterior..."
cd backend
rm -rf dist
rm -rf node_modules/.cache

echo "📦 Instalando dependencias..."
npm install

echo "🔨 Compilando aplicación..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso en ./backend/dist"
    echo ""
    echo "🚀 Listo para deploy!"
    echo "   1. Verificar variables en Railway"
    echo "   2. Commit y push"
    echo "   3. Railway detectará cambios automáticamente"
else
    echo "❌ Error en el build"
    exit 1
fi
