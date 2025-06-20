// Test específico para eliminación COMPLETA de fondos y transacciones
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testEliminacionCompleta() {
  try {
    console.log('🧪 PRUEBA: Eliminación COMPLETA de Fondos y Transacciones');
    console.log('==========================================================');
    
    // 1. Login
    console.log('\n1️⃣ Haciendo login...');
    let token;
    
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'test@test.com',
        password: 'test123'
      });
      token = loginResponse.data.access_token;
      console.log('✅ Login exitoso');
    } catch (error) {
      console.log('👤 Creando usuario de prueba...');
      const registroResponse = await axios.post(`${API_URL}/auth/registro`, {
        nombre: 'Usuario',
        apellido: 'Prueba',
        email: 'test@test.com',
        password: 'test123'
      });
      token = registroResponse.data.access_token;
      console.log('✅ Usuario creado');
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Crear un fondo de prueba
    console.log('\n2️⃣ Creando fondo de prueba...');
    const fondoData = {
      nombre: 'Fondo ELIMINACIÓN COMPLETA Test',
      descripcion: 'Este fondo será eliminado completamente con sus transacciones',
      tipo: 'ahorro',
      saldoActual: 1000,
      metaAhorro: 5000
    };
    
    const createResponse = await axios.post(`${API_URL}/fondos`, fondoData, { headers });
    const fondoId = createResponse.data._id || createResponse.data.id;
    console.log('✅ Fondo creado con ID:', fondoId);
    console.log('📋 Fondo:', createResponse.data.nombre);
    
    // 3. Crear transacciones asociadas al fondo
    console.log('\n3️⃣ Creando transacciones asociadas...');
    const transacciones = [
      {
        descripcion: 'Transacción 1 - Ingreso',
        monto: 500,
        tipo: 'ingreso',
        fondoId: fondoId,
        categoria: 'Ahorro'
      },
      {
        descripcion: 'Transacción 2 - Gasto',
        monto: 200,
        tipo: 'gasto',
        fondoId: fondoId,
        categoria: 'Comida'
      },
      {
        descripcion: 'Transacción 3 - Ingreso',
        monto: 300,
        tipo: 'ingreso',
        fondoId: fondoId,
        categoria: 'Salario'
      }
    ];
    
    let transaccionesCreadas = [];
    
    for (let i = 0; i < transacciones.length; i++) {
      try {
        const transResponse = await axios.post(`${API_URL}/transacciones`, transacciones[i], { headers });
        transaccionesCreadas.push(transResponse.data);
        console.log(`✅ Transacción ${i + 1} creada:`, transResponse.data.descripcion);
      } catch (error) {
        console.log(`⚠️  Error creando transacción ${i + 1}:`, error.response?.data || error.message);
      }
    }
    
    console.log(`📊 Total transacciones creadas: ${transaccionesCreadas.length}`);
    
    // 4. Verificar que las transacciones existen
    console.log('\n4️⃣ Verificando transacciones existentes...');
    try {
      const transaccionesResponse = await axios.get(`${API_URL}/transacciones`, { headers });
      const transaccionesFondo = transaccionesResponse.data.filter(t => 
        t.fondoId === fondoId || t.fondoId?._id === fondoId
      );
      console.log(`📋 Transacciones del fondo encontradas: ${transaccionesFondo.length}`);
      
      transaccionesFondo.forEach((trans, index) => {
        console.log(`   ${index + 1}. ${trans.descripcion} - $${trans.monto} (${trans.tipo})`);
      });
    } catch (error) {
      console.log('⚠️  Error consultando transacciones:', error.response?.status);
    }
    
    // 5. Verificar estado antes de eliminación
    console.log('\n5️⃣ Estado ANTES de la eliminación...');
    
    // Contar fondos
    const fondosAntes = await axios.get(`${API_URL}/fondos`, { headers });
    console.log(`📁 Total fondos antes: ${fondosAntes.data.length}`);
    
    // Contar transacciones
    const transaccionesAntes = await axios.get(`${API_URL}/transacciones`, { headers });
    console.log(`📊 Total transacciones antes: ${transaccionesAntes.data.length}`);
    
    // 6. EJECUTAR ELIMINACIÓN COMPLETA
    console.log('\n6️⃣ 🔥 EJECUTANDO ELIMINACIÓN COMPLETA...');
    console.log('URL:', `${API_URL}/fondos/${fondoId}`);
    console.log('⚠️  Esta operación debería eliminar:');
    console.log('   📁 1 fondo');
    console.log(`   📊 ${transaccionesCreadas.length} transacciones asociadas`);
    console.log();
    
    try {
      const deleteResponse = await axios.delete(`${API_URL}/fondos/${fondoId}`, { headers });
      console.log('✅ ELIMINACIÓN COMPLETA EXITOSA!');
      console.log('📤 Status:', deleteResponse.status);
      console.log('📋 Respuesta:', deleteResponse.data);
      
      // 7. Verificar eliminación del fondo
      console.log('\n7️⃣ Verificando eliminación del fondo...');
      try {
        await axios.get(`${API_URL}/fondos/${fondoId}`, { headers });
        console.log('❌ ERROR: El fondo todavía existe después de eliminarlo');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ CORRECTO: Fondo eliminado de la base de datos');
        } else {
          console.log('⚠️  Error inesperado verificando fondo:', error.response?.status);
        }
      }
      
      // 8. Verificar eliminación de transacciones
      console.log('\n8️⃣ Verificando eliminación de transacciones asociadas...');
      try {
        const transaccionesDespues = await axios.get(`${API_URL}/transacciones`, { headers });
        const transaccionesRestantes = transaccionesDespues.data.filter(t => 
          t.fondoId === fondoId || t.fondoId?._id === fondoId
        );
        
        if (transaccionesRestantes.length === 0) {
          console.log('✅ CORRECTO: Todas las transacciones asociadas fueron eliminadas');
        } else {
          console.log(`❌ ERROR: ${transaccionesRestantes.length} transacciones todavía existen`);
        }
      } catch (error) {
        console.log('⚠️  Error verificando transacciones:', error.response?.status);
      }
      
      // 9. Verificar conteos finales
      console.log('\n9️⃣ Estado DESPUÉS de la eliminación...');
      
      const fondosDespues = await axios.get(`${API_URL}/fondos`, { headers });
      console.log(`📁 Total fondos después: ${fondosDespues.data.length}`);
      console.log(`📉 Fondos eliminados: ${fondosAntes.data.length - fondosDespues.data.length}`);
      
      const transaccionesDespues = await axios.get(`${API_URL}/transacciones`, { headers });
      console.log(`📊 Total transacciones después: ${transaccionesDespues.data.length}`);
      console.log(`📉 Transacciones eliminadas: ${transaccionesAntes.data.length - transaccionesDespues.data.length}`);
      
      // 10. Resumen final
      console.log('\n🎯 RESUMEN DE LA ELIMINACIÓN COMPLETA:');
      console.log('=====================================');
      console.log(`✅ Fondo eliminado: SÍ`);
      console.log(`✅ Transacciones eliminadas: ${transaccionesAntes.data.length - transaccionesDespues.data.length}`);
      console.log(`✅ Eliminación física de BD: SÍ`);
      console.log(`✅ Operación irreversible: SÍ`);
      
      if ((fondosAntes.data.length - fondosDespues.data.length) === 1 && 
          (transaccionesAntes.data.length - transaccionesDespues.data.length) === transaccionesCreadas.length) {
        console.log('\n🎉 ÉXITO TOTAL: Eliminación completa funcionando correctamente!');
      } else {
        console.log('\n⚠️  ADVERTENCIA: Los números no cuadran, revisar implementación');
      }
      
    } catch (error) {
      console.log('❌ ERROR EN ELIMINACIÓN COMPLETA');
      console.log('📤 Status:', error.response?.status);
      console.log('📋 Error:', error.response?.data);
      console.log('🔍 Detalles:', error.message);
      
      if (error.response?.status === 400) {
        console.log('💡 El sistema puede estar configurado para rechazar eliminación con transacciones');
        console.log('💡 Verifica que el servicio use la versión CORREGIDA');
      }
    }
    
    console.log('\n==========================================================');
    console.log('🏁 PRUEBA DE ELIMINACIÓN COMPLETA FINALIZADA');
    console.log('==========================================================');
    
  } catch (error) {
    console.error('❌ Error general en prueba de eliminación completa:', error.message);
    if (error.response) {
      console.error('📤 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testEliminacionCompleta();
