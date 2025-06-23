#!/bin/bash

# Script para reparar dependencias antes del deploy
# Ejecutar desde la carpeta backend

echo "🔧 Reparando dependencias del backend..."

# Limpiar archivos de lock existentes
echo "📁 Limpiando archivos de lock..."
rm -f package-lock.json
rm -f npm-shrinkwrap.json

# Limpiar cache de npm
echo "🧹 Limpiando cache de npm..."
npm cache clean --force

# Limpiar node_modules
echo "📦 Limpiando node_modules..."
rm -rf node_modules

# Reinstalar dependencias
echo "⬇️ Reinstalando dependencias..."
npm install

# Verificar que el build funciona
echo "🏗️ Verificando build..."
npm run build

echo "✅ ¡Dependencias reparadas! Ahora puedes hacer deploy en Railway."
