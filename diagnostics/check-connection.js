// Script de diagnóstico para verificar la conexión Frontend-Backend
const http = require('http');
const { exec } = require('child_process');

console.log('=== DIAGNÓSTICO DE CONEXIÓN CONTROL FINANCIERO ===\n');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

// Función para verificar si un puerto está en uso
function checkPort(port, name) {
  return new Promise((resolve) => {
    const options = {
      port: port,
      host: 'localhost',
      method: 'GET',
      path: '/'
    };

    const req = http.request(options, (res) => {
      console.log(`${colors.green}✓${colors.reset} ${name} está ejecutándose en puerto ${port}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`${colors.red}✗${colors.reset} ${name} NO está ejecutándose en puerto ${port}`);
      resolve(false);
    });

    req.setTimeout(2000);
    req.end();
  });
}

// Función para verificar la API
async function checkAPI() {
  return new Promise((resolve) => {
    const options = {
      port: 3000,
      host: 'localhost',
      method: 'GET',
      path: '/api/docs'
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
        console.log(`${colors.green}✓${colors.reset} API Swagger disponible en http://localhost:3000/api/docs`);
        resolve(true);
      } else {
        console.log(`${colors.yellow}⚠${colors.reset} API responde pero Swagger no disponible`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`${colors.red}✗${colors.reset} API no responde`);
      resolve(false);
    });

    req.setTimeout(2000);
    req.end();
  });
}

// Función para verificar MongoDB
function checkMongoDB() {
  return new Promise((resolve) => {
    exec('mongosh --eval "db.version()" --quiet', (error, stdout, stderr) => {
      if (error) {
        console.log(`${colors.yellow}⚠${colors.reset} MongoDB no detectado (puede estar usando Docker o conexión remota)`);
        resolve(false);
      } else {
        console.log(`${colors.green}✓${colors.reset} MongoDB está ejecutándose - versión ${stdout.trim()}`);
        resolve(true);
      }
    });
  });
}

// Función principal
async function runDiagnostics() {
  console.log(`${colors.bright}1. Verificando servicios...${colors.reset}\n`);
  
  const backendRunning = await checkPort(3000, 'Backend (NestJS)');
  const frontendRunning = await checkPort(4200, 'Frontend (Angular)');
  const apiAvailable = await checkAPI();
  const mongoRunning = await checkMongoDB();

  console.log(`\n${colors.bright}2. URLs de acceso:${colors.reset}\n`);
  console.log(`   Frontend:     ${colors.blue}http://localhost:4200${colors.reset}`);
  console.log(`   Backend API:  ${colors.blue}http://localhost:3000${colors.reset}`);
  console.log(`   Swagger Docs: ${colors.blue}http://localhost:3000/api/docs${colors.reset}`);

  console.log(`\n${colors.bright}3. Estado general:${colors.reset}\n`);
  
  if (backendRunning && frontendRunning) {
    console.log(`${colors.green}✓ Sistema funcionando correctamente${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Hay servicios que no están ejecutándose${colors.reset}`);
    
    if (!backendRunning) {
      console.log(`\n${colors.yellow}Para iniciar el backend:${colors.reset}`);
      console.log('   cd backend');
      console.log('   npm install');
      console.log('   npm run start:dev');
    }
    
    if (!frontendRunning) {
      console.log(`\n${colors.yellow}Para iniciar el frontend:${colors.reset}`);
      console.log('   cd frontend');
      console.log('   npm install');
      console.log('   npm start');
    }
  }

  // Verificar configuración
  console.log(`\n${colors.bright}4. Verificando configuración...${colors.reset}\n`);
  
  try {
    const fs = require('fs');
    const envPath = require('path').join(__dirname, '..', 'backend', '.env');
    
    if (fs.existsSync(envPath)) {
      console.log(`${colors.green}✓${colors.reset} Archivo .env encontrado en backend`);
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('MONGODB_URI=')) {
        console.log(`${colors.green}✓${colors.reset} MONGODB_URI configurado`);
      }
      if (envContent.includes('JWT_SECRET=')) {
        console.log(`${colors.green}✓${colors.reset} JWT_SECRET configurado`);
      }
    } else {
      console.log(`${colors.red}✗${colors.reset} Archivo .env NO encontrado en backend`);
      console.log(`${colors.yellow}  Copia backend/.env.example a backend/.env${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠${colors.reset} No se pudo verificar la configuración`);
  }

  console.log('\n=== FIN DEL DIAGNÓSTICO ===\n');
}

// Ejecutar diagnóstico
runDiagnostics();
