const { exec } = require('child_process');

console.log('🔍 DIAGNÓSTICO DE REPORTES FINANCIEROS');
console.log('=====================================');

// Test del endpoint de reportes
const testUrl = 'http://localhost:3000/api/reportes/test';
console.log(`\n📡 Probando conectividad: ${testUrl}`);

exec(`curl -X GET ${testUrl}`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error al probar conectividad:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Warning:', stderr);
  }
  
  try {
    const response = JSON.parse(stdout);
    console.log('✅ Respuesta del servicio:', response);
  } catch (e) {
    console.log('📄 Respuesta cruda:', stdout);
  }
});

console.log('\n🔧 Para probar con autenticación, usa:');
console.log('curl -X GET http://localhost:3000/api/reportes/dashboard \\');
console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN"');

console.log('\n💡 Pasos para diagnosticar problemas:');
console.log('1. Verificar que el backend esté corriendo en puerto 3000');
console.log('2. Verificar que tengas fondos creados');
console.log('3. Verificar que tengas transacciones registradas');
console.log('4. Revisar los logs del backend para más detalles');
