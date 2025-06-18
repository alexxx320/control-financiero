// Script para diagnosticar problemas de autenticación
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

console.log('=== DIAGNÓSTICO DE AUTENTICACIÓN ===\n');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

// Función para probar el health check
async function testHealthCheck() {
  console.log(`${colors.blue}1. Probando Health Check...${colors.reset}`);
  try {
    const response = await axios.get(`${API_URL}`);
    console.log(`${colors.green}✓ Backend respondiendo correctamente${colors.reset}`);
    console.log(`  Respuesta: ${JSON.stringify(response.data)}\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Backend no responde${colors.reset}`);
    console.log(`  Error: ${error.message}\n`);
    return false;
  }
}

// Función para probar registro
async function testRegistro() {
  console.log(`${colors.blue}2. Probando Registro de Usuario...${colors.reset}`);
  
  const testUser = {
    nombre: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'test123'
  };
  
  try {
    const response = await axios.post(`${API_URL}/auth/registro`, testUser);
    console.log(`${colors.green}✓ Registro exitoso${colors.reset}`);
    console.log(`  Token recibido: ${response.data.access_token ? 'Sí' : 'No'}`);
    console.log(`  Usuario: ${response.data.usuario?.email || response.data.user?.email}\n`);
    return response.data.access_token;
  } catch (error) {
    console.log(`${colors.red}✗ Error en registro${colors.reset}`);
    console.log(`  Status: ${error.response?.status}`);
    console.log(`  Mensaje: ${error.response?.data?.message || error.message}\n`);
    return null;
  }
}

// Función para probar login
async function testLogin() {
  console.log(`${colors.blue}3. Probando Login...${colors.reset}`);
  
  const credentials = {
    email: 'test@example.com',
    password: 'test123'
  };
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    console.log(`${colors.green}✓ Login exitoso${colors.reset}`);
    console.log(`  Token recibido: ${response.data.access_token ? 'Sí' : 'No'}\n`);
    return response.data.access_token;
  } catch (error) {
    console.log(`${colors.yellow}⚠ Login falló (puede ser normal si el usuario no existe)${colors.reset}`);
    console.log(`  Status: ${error.response?.status}`);
    console.log(`  Mensaje: ${error.response?.data?.message || error.message}\n`);
    return null;
  }
}

// Función para probar endpoint protegido
async function testProtectedEndpoint(token) {
  console.log(`${colors.blue}4. Probando Endpoint Protegido...${colors.reset}`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠ Sin token, saltando prueba${colors.reset}\n`);
    return;
  }
  
  try {
    const response = await axios.get(`${API_URL}/fondos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`${colors.green}✓ Acceso autorizado a endpoint protegido${colors.reset}`);
    console.log(`  Fondos encontrados: ${Array.isArray(response.data) ? response.data.length : 0}\n`);
  } catch (error) {
    console.log(`${colors.red}✗ Error accediendo a endpoint protegido${colors.reset}`);
    console.log(`  Status: ${error.response?.status}`);
    console.log(`  Mensaje: ${error.response?.data?.message || error.message}\n`);
  }
}

// Función para verificar CORS
async function testCORS() {
  console.log(`${colors.blue}5. Verificando CORS...${colors.reset}`);
  
  try {
    const response = await axios.options(`${API_URL}/auth/login`, {
      headers: {
        'Origin': 'http://localhost:4200',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });
    
    const corsHeaders = response.headers['access-control-allow-origin'];
    if (corsHeaders) {
      console.log(`${colors.green}✓ CORS configurado correctamente${colors.reset}`);
      console.log(`  Allow-Origin: ${corsHeaders}\n`);
    } else {
      console.log(`${colors.yellow}⚠ CORS puede no estar configurado${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ No se pudo verificar CORS${colors.reset}\n`);
  }
}

// Ejecutar todas las pruebas
async function runDiagnostics() {
  console.log('Iniciando diagnóstico...\n');
  
  // 1. Health check
  const backendOk = await testHealthCheck();
  
  if (!backendOk) {
    console.log(`${colors.red}=== DIAGNÓSTICO FALLIDO ===${colors.reset}`);
    console.log('El backend no está respondiendo. Asegúrate de que esté ejecutándose en el puerto 3000.');
    console.log('\nPara iniciar el backend:');
    console.log('  cd backend');
    console.log('  npm run start:dev');
    return;
  }
  
  // 2. Registro
  const token = await testRegistro();
  
  // 3. Login
  await testLogin();
  
  // 4. Endpoint protegido
  await testProtectedEndpoint(token);
  
  // 5. CORS
  await testCORS();
  
  // Resumen
  console.log(`${colors.blue}=== RESUMEN ===${colors.reset}`);
  console.log('\nSi todas las pruebas pasaron, el sistema de autenticación está funcionando correctamente.');
  console.log('\nSi hay errores:');
  console.log('1. Verifica que MongoDB esté ejecutándose');
  console.log('2. Revisa el archivo .env del backend');
  console.log('3. Asegúrate de que el frontend esté usando el proxy correcto');
  console.log('\nPara más detalles, revisa los logs del backend.');
}

// Instalar axios si no está instalado
const { exec } = require('child_process');

exec('npm list axios', (error, stdout, stderr) => {
  if (error) {
    console.log('Instalando axios...');
    exec('npm install axios', (error, stdout, stderr) => {
      if (error) {
        console.error('Error instalando axios:', error);
        return;
      }
      runDiagnostics();
    });
  } else {
    runDiagnostics();
  }
});
