// Script para probar autenticación
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAuth() {
  try {
    console.log('🧪 Iniciando pruebas de autenticación...');
    
    // 1. Verificar salud del servidor
    try {
      const health = await axios.get(`${API_URL.replace('/api', '')}/health`);
      console.log('✅ Servidor corriendo:', health.data);
    } catch (error) {
      console.error('❌ Servidor no disponible:', error.message);
      return;
    }
    
    // 2. Probar login
    const loginData = {
      email: 'test@test.com',
      password: 'test123'
    };
    
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
      console.log('✅ Login exitoso');
      console.log('🔑 Token recibido:', loginResponse.data.access_token.substring(0, 30) + '...');
      console.log('👤 Usuario:', loginResponse.data.usuario);
      
      // 3. Probar petición protegida
      const token = loginResponse.data.access_token;
      const protectedResponse = await axios.get(`${API_URL}/fondos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Petición protegida exitosa. Fondos encontrados:', protectedResponse.data.length);
      
    } catch (loginError) {
      console.error('❌ Error en login:', loginError.response?.data || loginError.message);
      
      if (loginError.response?.status === 401) {
        console.log('💡 Sugerencia: Crear usuario de prueba primero');
        await testRegistro();
      }
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.response?.data || error.message);
  }
}

async function testRegistro() {
  try {
    console.log('📝 Intentando crear usuario de prueba...');
    
    const registroData = {
      nombre: 'Usuario',
      apellido: 'Prueba',
      email: 'test@test.com',
      password: 'test123'
    };
    
    const registroResponse = await axios.post(`${API_URL}/auth/registro`, registroData);
    console.log('✅ Usuario creado exitosamente');
    console.log('🔑 Token recibido:', registroResponse.data.access_token.substring(0, 30) + '...');
    
    return registroResponse.data.access_token;
    
  } catch (registroError) {
    console.error('❌ Error en registro:', registroError.response?.data || registroError.message);
  }
}

// Ejecutar pruebas
testAuth();
