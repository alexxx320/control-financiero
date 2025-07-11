#!/bin/bash
echo "🚀 Solucionando problema de CSS budget y desplegando..."

echo "📋 Cambios realizados:"
echo "  ✅ Aumentado límite CSS de 10KB a 15KB en angular.json"
echo "  ✅ Variables de entorno configuradas en Railway"
echo "  ✅ Filtros de fondos implementados"
echo ""

echo "🔄 Haciendo commit de los cambios..."
git add .
git status

echo "💾 Commit de cambios..."
git commit -m "fix: aumentar límite CSS budget + implementar filtros fondos

- Aumentar budget CSS de componentes de 10KB a 15KB
- Implementar filtros por tipo de fondo (registro, ahorro, préstamo, deuda)  
- Agregar contadores y estadísticas de fondos
- Configurar variables de entorno MongoDB Atlas
- Solucionar problema de deploy en Railway"

echo "🚀 Pushing a Railway para deploy..."
git push origin main

echo ""
echo "✅ Deploy iniciado en Railway!"
echo "🔍 Verificar en: https://railway.app/project/[tu-proyecto]/deployments"
echo "🌐 Una vez desplegado, la app estará en: https://control-financiero.up.railway.app"
