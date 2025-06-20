// Script para probar operaciones CRUD
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testCRUD() {
  try {
    console.log('🧪 Iniciando pruebas CRUD...');
    
    // 1. Login para obtener token
    const loginData = {
      email: 'test@test.com',
      password: 'test123'
    };
    
    let token;
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
      token = loginResponse.data.access_token;
      console.log('✅ Login exitoso para CRUD');
    } catch (error) {
      console.error('❌ Error en login, creando usuario...');
      // Crear usuario si no existe
      const registroData = {
        nombre: 'Usuario',
        apellido: 'Prueba',
        email: 'test@test.com',
        password: 'test123'
      };
      
      const registroResponse = await axios.post(`${API_URL}/auth/registro`, registroData);
      token = registroResponse.data.access_token;
      console.log('✅ Usuario creado para CRUD');
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('🔑 Usando token:', token.substring(0, 30) + '...');
    
    // 2. Test CREATE - Crear un fondo
    console.log('\n📝 Probando CREATE...');
    const nuevoFondo = {
      nombre: 'Fondo Test CRUD',
      descripcion: 'Fondo creado en prueba CRUD',
      tipo: 'ahorro',
      objetivo: 1000000,
      saldoActual: 0
    };
    
    try {
      const createResponse = await axios.post(`${API_URL}/fondos`, nuevoFondo, { headers });
      console.log('✅ CREATE exitoso - Fondo creado:', createResponse.data.id);
      var fondoId = createResponse.data.id;
    } catch (error) {
      console.error('❌ Error en CREATE:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers enviados:', headers);
      return;
    }
    
    // 3. Test READ - Leer fondos
    console.log('\n📖 Probando READ...');
    try {
      const readResponse = await axios.get(`${API_URL}/fondos`, { headers });
      console.log('✅ READ exitoso - Fondos encontrados:', readResponse.data.length);
      
      // Leer fondo específico
      if (fondoId) {
        const readOneResponse = await axios.get(`${API_URL}/fondos/${fondoId}`, { headers });
        console.log('✅ READ ONE exitoso - Fondo:', readOneResponse.data.nombre);
      }
    } catch (error) {
      console.error('❌ Error en READ:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
    }
    
    // 4. Test UPDATE - Actualizar fondo
    if (fondoId) {
      console.log('\n📝 Probando UPDATE...');
      const updateData = {
        nombre: 'Fondo Test CRUD Actualizado',
        objetivo: 1500000
      };
      
      try {
        const updateResponse = await axios.patch(`${API_URL}/fondos/${fondoId}`, updateData, { headers });
        console.log('✅ UPDATE exitoso - Fondo actualizado:', updateResponse.data.nombre);
      } catch (error) {
        console.error('❌ Error en UPDATE:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
      }
    }
    
    // 5. Test DELETE - Eliminar fondo
    if (fondoId) {
      console.log('\n🗑️ Probando DELETE...');
      try {
        await axios.delete(`${API_URL}/fondos/${fondoId}`, { headers });
        console.log('✅ DELETE exitoso - Fondo eliminado');
      } catch (error) {
        console.error('❌ Error en DELETE:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
      }
    }
    
    // 6. Test de transacciones
    console.log('\n💰 Probando operaciones de transacciones...');
    try {
      const transaccionesResponse = await axios.get(`${API_URL}/transacciones`, { headers });
      console.log('✅ Transacciones READ exitoso:', transaccionesResponse.data.length);
    } catch (error) {
      console.error('❌ Error en transacciones:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Pruebas CRUD completadas');
    
  } catch (error) {
    console.error('❌ Error general en pruebas CRUD:', error.message);
  }
}

// Función adicional para verificar endpoints disponibles
async function verificarEndpoints() {
  console.log('\n🔍 Verificando endpoints disponibles...');
  
  const endpoints = [
    '/health',
    '/api/auth/login',
    '/api/auth/registro',
    '/api/fondos',
    '/api/transacciones'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = endpoint.startsWith('/api') ? 
        `http://localhost:3000${endpoint}` : 
        `http://localhost:3000${endpoint}`;
        
      await axios.get(url);
      console.log('✅', endpoint, '- Disponible');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('🔒', endpoint, '- Protegido (requiere auth)');
      } else if (error.response?.status === 404) {
        console.log('❌', endpoint, '- No encontrado');
      } else {
        console.log('⚠️', endpoint, '- Error:', error.response?.status || error.message);
      }
    }
  }
}

// Ejecutar ambas pruebas
async function ejecutarPruebas() {
  await verificarEndpoints();
  await testCRUD();
}

ejecutarPruebas();
