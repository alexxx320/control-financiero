// Script para probar las rutas de la API
const http = require('http');

console.log('=== PROBANDO RUTAS DE LA API ===\n');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

// Token de prueba (deberás reemplazarlo con uno válido)
const testToken = 'fake-jwt-token';

// Rutas a probar
const routes = [
  { method: 'GET', path: '/api/fondos', auth: true, description: 'Listar fondos' },
  { method: 'GET', path: '/api/transacciones', auth: true, description: 'Listar transacciones' },
  { method: 'GET', path: '/api/reportes/resumen', auth: true, description: 'Resumen financiero' },
  { method: 'POST', path: '/api/auth/login', auth: false, description: 'Login', 
    body: JSON.stringify({ email: 'test@test.com', password: 'test123' }) },
  { method: 'GET', path: '/api/docs', auth: false, description: 'Documentación Swagger' },
  { method: 'GET', path: '/api', auth: false, description: 'API Root' }
];

// Función para probar una ruta
function testRoute(route) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: route.path,
      method: route.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (route.auth) {
      options.headers['Authorization'] = `Bearer ${testToken}`;
    }

    console.log(`${colors.blue}Probando:${colors.reset} ${route.method} ${route.path} - ${route.description}`);

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`${colors.green}✓ Éxito${colors.reset} - Status: ${res.statusCode}`);
        } else if (res.statusCode === 401) {
          console.log(`${colors.yellow}⚠ No autorizado${colors.reset} - Status: ${res.statusCode} (necesita token válido)`);
        } else if (res.statusCode === 404) {
          console.log(`${colors.red}✗ No encontrado${colors.reset} - Status: ${res.statusCode}`);
        } else {
          console.log(`${colors.red}✗ Error${colors.reset} - Status: ${res.statusCode}`);
        }
        
        if (data && res.statusCode !== 200) {
          try {
            const parsed = JSON.parse(data);
            console.log(`  Respuesta: ${parsed.message || data.substring(0, 100)}`);
          } catch {
            console.log(`  Respuesta: ${data.substring(0, 100)}`);
          }
        }
        
        console.log('');
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`${colors.red}✗ Error de conexión${colors.reset} - ${err.message}`);
      console.log('');
      resolve();
    });

    req.setTimeout(5000);
    
    if (route.body) {
      req.write(route.body);
    }
    
    req.end();
  });
}

// Función principal
async function testAPI() {
  // Primero verificar si el backend está corriendo
  const backendCheck = await new Promise((resolve) => {
    http.get('http://localhost:3000', (res) => {
      resolve(true);
    }).on('error', () => {
      resolve(false);
    });
  });

  if (!backendCheck) {
    console.log(`${colors.red}✗ El backend no está ejecutándose en el puerto 3000${colors.reset}`);
    console.log('\nPara iniciar el backend:');
    console.log('  cd backend');
    console.log('  npm run start:dev');
    return;
  }

  console.log(`${colors.green}✓ Backend detectado en puerto 3000${colors.reset}\n`);

  // Probar todas las rutas
  for (const route of routes) {
    await testRoute(route);
  }

  console.log('=== PRUEBA COMPLETADA ===\n');
  
  console.log('NOTA: Si las rutas devuelven 401 (No autorizado), es normal.');
  console.log('Necesitas un token JWT válido. Puedes obtenerlo:');
  console.log('1. Haciendo login desde el frontend');
  console.log('2. Usando la ruta POST /api/auth/login con credenciales válidas');
}

// Ejecutar pruebas
testAPI();
