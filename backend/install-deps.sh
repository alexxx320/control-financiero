#!/bin/bash

echo "🚀 Instalando dependencias del backend..."

cd "$(dirname "$0")"

echo "📦 Instalando dependencias de producción..."
npm install cookie-parser helmet express-rate-limit

echo "🔧 Instalando dependencias de desarrollo..."
npm install --save-dev @types/cookie-parser

echo "✅ Dependencias instaladas correctamente!"
echo ""
echo "Ahora puedes ejecutar:"
echo "npm run start:dev"
