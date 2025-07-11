#!/bin/bash
echo "🔨 Verificando que el frontend compile correctamente..."

cd frontend

echo "📦 Instalando dependencias del frontend..."
npm install

echo "🧹 Limpiando cache de Angular..."
npm run ng cache clean

echo "🔨 Compilando frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend compilado exitosamente"
    echo "📁 Build generado en: frontend/dist/"
    ls -la dist/ 2>/dev/null || echo "Directorio dist creado"
else
    echo "❌ Error en la compilación del frontend"
    exit 1
fi

echo ""
echo "🚀 Listo para deploy!"
echo "   1. Los cambios están localmente ✅"
echo "   2. El frontend compila ✅"
echo "   3. Hacer commit y push para Railway"
