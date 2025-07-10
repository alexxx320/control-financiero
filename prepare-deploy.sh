#!/bin/bash
# Script para preparar el build antes del deploy

echo "🔨 Compilando aplicación localmente..."
cd backend
npm install
npm run build
echo "✅ Build completado en ./backend/dist"

echo "🚀 Listo para deploy a Railway"
echo "El Dockerfile copiará el build ya compilado"
