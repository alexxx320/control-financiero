#!/bin/bash
echo "💰 Restaurando funcionalidad completa de préstamos y deudas..."

echo "📋 Funcionalidades restauradas:"
echo "  ✅ Información detallada de préstamos:"
echo "      - Monto prestado"
echo "      - Monto pagado" 
echo "      - Monto pendiente"
echo "      - Barra de progreso de pago"
echo "      - Estado de completado"
echo ""
echo "  ✅ Información detallada de deudas:"
echo "      - Total de deuda"
echo "      - Monto pagado"
echo "      - Monto pendiente" 
echo "      - Barra de progreso de pago"
echo "      - Estado de liquidación"
echo ""
echo "  ✅ Estilos y colores específicos:"
echo "      - Gradientes naranjas para préstamos"
echo "      - Gradientes rojos para deudas"
echo "      - Barras de progreso coloreadas"
echo "      - Indicadores visuales de estado"
echo ""

echo "🔄 Haciendo commit de los cambios..."
git add .

echo "💾 Commit de funcionalidad completa..."
git commit -m "feat: restaurar funcionalidad completa préstamos y deudas

- Restaurar información detallada para fondos tipo préstamo:
  * Monto prestado, pagado y pendiente
  * Barra de progreso con porcentaje de pago
  * Indicador visual cuando está completamente pagado
  
- Restaurar información detallada para fondos tipo deuda:
  * Total deuda, pagado y pendiente  
  * Barra de progreso con porcentaje de liquidación
  * Indicador visual cuando está completamente liquidada
  
- Estilos específicos:
  * Gradientes naranjas para préstamos
  * Gradientes rojos para deudas
  * Barras de progreso coloreadas según tipo
  * Estados visuales con emojis y colores
  
- Mantener filtros por tipo completamente funcionales
- Integración con PrestamoUtils y DeudaUtils
- Formato de moneda COP para todos los valores"

echo "🚀 Pushing a Railway para deploy..."
git push origin main

echo ""
echo "✅ Deploy con funcionalidad completa iniciado!"
echo ""
echo "💰 Funcionalidades de préstamos y deudas restauradas:"
echo "  📊 Estadísticas detalladas por tipo de fondo ✅"
echo "  📈 Barras de progreso específicas ✅" 
echo "  💸 Cálculos automáticos de pagos ✅"
echo "  🎨 Estilos diferenciados por tipo ✅"
echo "  🔢 Formato de moneda colombiana ✅"
echo ""
echo "🔍 Verificar en: https://control-financiero.up.railway.app/fondos"
echo "🎯 Crear fondos tipo 'préstamo' y 'deuda' para ver toda la funcionalidad"
