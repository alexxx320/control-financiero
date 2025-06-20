// Script específico para probar eliminación de fondos
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testEliminacionEspecifica() {
  try {
    console.log('🧪 PRUEBA ESPECÍFICA: Eliminación de Fondos');
    console.log('================================================');
    
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
      // Crear usuario si no existe
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
    
    console.log('🔑 Token obtenido:', token.substring(0, 30) + '...');
    
    // 2. Crear un fondo para eliminar
    console.log('\n2️⃣ Creando fondo de prueba...');
    const fondoData = {
      nombre: 'Fondo ELIMINAR Test',
      descripcion: 'Este fondo será eliminado en la prueba',
      tipo: 'ahorro',
      saldoActual: 1000,
      metaAhorro: 5000
    };
    
    const createResponse = await axios.post(`${API_URL}/fondos`, fondoData, { headers });
    const fondoId = createResponse.data._id || createResponse.data.id;
    console.log('✅ Fondo creado con ID:', fondoId);
    console.log('📋 Fondo creado:', createResponse.data.nombre);
    
    // 3. Verificar que el fondo existe
    console.log('\n3️⃣ Verificando que el fondo existe...');
    const readResponse = await axios.get(`${API_URL}/fondos/${fondoId}`, { headers });
    console.log('✅ Fondo encontrado:', readResponse.data.nombre);
    
    // 4. Verificar si tiene transacciones (no debería tener)
    console.log('\n4️⃣ Verificando transacciones asociadas...');
    try {
      const transaccionesResponse = await axios.get(`${API_URL}/transacciones?fondoId=${fondoId}`, { headers });
      console.log('📊 Transacciones encontradas:', transaccionesResponse.data.length);
      
      if (transaccionesResponse.data.length > 0) {
        console.log('⚠️  Este fondo tiene transacciones, la eliminación debería fallar');
      } else {
        console.log('✅ No hay transacciones, la eliminación debería funcionar');
      }
    } catch (error) {
      console.log('ℹ️  No se pudieron consultar transacciones:', error.response?.status);
    }
    
    // 5. PROBAR ELIMINACIÓN
    console.log('\n5️⃣ 🗑️  PROBANDO ELIMINACIÓN...');
    console.log('URL:', `${API_URL}/fondos/${fondoId}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    
    try {
      const deleteResponse = await axios.delete(`${API_URL}/fondos/${fondoId}`, { headers });
      console.log('✅ ELIMINACIÓN EXITOSA!');
      console.log('📤 Status:', deleteResponse.status);
      console.log('📋 Respuesta:', deleteResponse.data);
      
      // 6. Verificar que el fondo ya no existe
      console.log('\n6️⃣ Verificando que el fondo fue eliminado...');
      try {
        await axios.get(`${API_URL}/fondos/${fondoId}`, { headers });
        console.log('❌ ERROR: El fondo todavía existe después de eliminarlo');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ CORRECTO: Fondo no encontrado (eliminado exitosamente)');
        } else {
          console.log('⚠️  Error inesperado al verificar:', error.response?.status);
        }
      }
      
      // 7. Verificar lista de fondos
      console.log('\n7️⃣ Verificando lista actualizada de fondos...');
      const listaResponse = await axios.get(`${API_URL}/fondos`, { headers });
      const fondoEliminado = listaResponse.data.find(f => f._id === fondoId || f.id === fondoId);
      
      if (fondoEliminado) {
        console.log('❌ ERROR: El fondo eliminado todavía aparece en la lista');
      } else {
        console.log('✅ CORRECTO: El fondo no aparece en la lista');
        console.log('📊 Total de fondos en la lista:', listaResponse.data.length);
      }
      
    } catch (error) {
      console.log('❌ ERROR EN ELIMINACIÓN');
      console.log('📤 Status:', error.response?.status);
      console.log('📋 Error:', error.response?.data);
      console.log('🔍 Error completo:', error.message);
      
      if (error.response?.status === 400) {
        console.log('💡 Posible causa: El fondo tiene transacciones asociadas');
      } else if (error.response?.status === 401) {
        console.log('💡 Posible causa: Problema de autenticación/autorización');
      } else if (error.response?.status === 404) {
        console.log('💡 Posible causa: Fondo no encontrado');
      } else if (error.response?.status === 500) {
        console.log('💡 Posible causa: Error interno del servidor/MongoDB');
      }
      
      // Si falló la eliminación, limpiar manualmente
      console.log('\n🧹 Intentando limpiar el fondo de prueba...');
      try {
        // Verificar si todavía existe
        await axios.get(`${API_URL}/fondos/${fondoId}`, { headers });
        console.log('⚠️  El fondo todavía existe, no se pudo limpiar automáticamente');
        console.log('🔧 Elimínalo manualmente desde el frontend o MongoDB');
      } catch (cleanupError) {
        if (cleanupError.response?.status === 404) {
          console.log('✅ El fondo no existe, no hay nada que limpiar');
        }
      }
    }
    
    console.log('\n================================================');
    console.log('🎯 RESUMEN DE LA PRUEBA DE ELIMINACIÓN');
    console.log('================================================');
    
  } catch (error) {
    console.error('❌ Error general en prueba de eliminación:', error.message);
    if (error.response) {
      console.error('📤 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testEliminacionEspecifica();
