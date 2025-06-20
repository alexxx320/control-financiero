@echo off
setlocal enabledelayedexpansion
title DIAGNÓSTICO AVANZADO: Eliminación de Fondos
echo ============================================
echo   DIAGNÓSTICO AVANZADO DE ELIMINACIÓN
echo ============================================

echo.
echo 🔬 Realizando análisis profundo del sistema...
echo.

echo 📋 PASO 1: Verificando configuración de MongoDB...
echo ====================================================
echo Verificando si MongoDB está ejecutándose...

:: Intentar conectar a MongoDB directamente
mongo --eval "db.runCommand('ping')" --quiet > temp_mongo.txt 2>&1
if !errorlevel!==0 (
    echo ✅ MongoDB está ejecutándose y responde
    del temp_mongo.txt > nul 2>&1
) else (
    echo ❌ MongoDB no está ejecutándose o no responde
    echo 🔧 Soluciones:
    echo 1. Ejecuta: net start MongoDB
    echo 2. O inicia MongoDB manualmente: mongod
    echo 3. Verifica que el puerto 27017 esté libre
    echo.
    del temp_mongo.txt > nul 2>&1
)

echo.
echo 📋 PASO 2: Verificando estructura de la base de datos...
echo ========================================================
node -e "
const { MongoClient } = require('mongodb');
(async () => {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('✅ Conexión a MongoDB exitosa');
    
    const db = client.db('control-financiero');
    const collections = await db.listCollections().toArray();
    console.log('📊 Colecciones encontradas:', collections.map(c => c.name).join(', '));
    
    const fondosCount = await db.collection('fondos').countDocuments();
    console.log('📁 Total de fondos en BD:', fondosCount);
    
    const usuariosCount = await db.collection('usuarios').countDocuments();
    console.log('👤 Total de usuarios en BD:', usuariosCount);
    
    await client.close();
  } catch (error) {
    console.log('❌ Error conectando a MongoDB:', error.message);
  }
})();
" 2>nul

echo.
echo 📋 PASO 3: Verificando configuración del backend...
echo ===================================================

:: Verificar archivo .env
if exist "backend\.env" (
    echo ✅ Archivo .env encontrado
    echo 🔍 Configuración JWT_SECRET:
    findstr "JWT_SECRET" backend\.env 2>nul | echo     Configurado
    echo 🔍 Configuración MONGODB_URI:
    findstr "MONGODB_URI" backend\.env 2>nul || echo     No configurado (usando default)
) else (
    echo ⚠️  Archivo .env no encontrado en backend
    echo 💡 Creando .env con configuración por defecto...
    echo JWT_SECRET=secreto-super-seguro-para-desarrollo > backend\.env
    echo MONGODB_URI=mongodb://localhost:27017/control-financiero >> backend\.env
    echo PORT=3000 >> backend\.env
    echo ✅ Archivo .env creado
)

echo.
echo 📋 PASO 4: Probando endpoints específicos...
echo ============================================

echo 🔐 Probando autenticación...
node -e "
const axios = require('axios');
(async () => {
  try {
    // Intento de login
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@test.com',
      password: 'test123'
    });
    console.log('✅ Login exitoso, token obtenido');
    
    // Probar endpoint protegido
    const fondosResponse = await axios.get('http://localhost:3000/api/fondos', {
      headers: { Authorization: \`Bearer \${response.data.access_token}\` }
    });
    console.log('✅ Endpoint de fondos accesible con token');
    console.log('📊 Fondos encontrados:', fondosResponse.data.length);
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Credenciales incorrectas - creando usuario...');
      try {
        await axios.post('http://localhost:3000/api/auth/registro', {
          nombre: 'Usuario',
          apellido: 'Prueba',
          email: 'test@test.com',
          password: 'test123'
        });
        console.log('✅ Usuario creado exitosamente');
      } catch (regError) {
        console.log('❌ Error creando usuario:', regError.response?.data || regError.message);
      }
    } else {
      console.log('❌ Error en autenticación:', error.response?.data || error.message);
    }
  }
})();
" 2>nul

echo.
echo 📋 PASO 5: Verificando logs del backend...
echo ==========================================
echo ℹ️  Si el backend está ejecutándose en otra terminal,
echo    revisa los logs para ver errores específicos.
echo.
echo 🔍 Logs comunes a buscar:
echo   - "JWT Strategy - Usuario validado exitosamente"
echo   - "🗑️ Backend - Eliminando fondo"
echo   - "✅ Backend - Fondo eliminado exitosamente"
echo   - Errores de MongoDB o conexión
echo.

echo 📋 PASO 6: Verificando configuración del frontend...
echo =====================================================

echo 🔍 Verificando proxy.conf.json...
if exist "frontend\proxy.conf.json" (
    echo ✅ Archivo proxy.conf.json encontrado
    type frontend\proxy.conf.json | findstr "3000" > nul
    if !errorlevel!==0 (
        echo ✅ Proxy configurado para puerto 3000
    ) else (
        echo ⚠️  Proxy no configurado correctamente
    )
) else (
    echo ❌ Archivo proxy.conf.json no encontrado
)

echo.
echo 🔍 Verificando environment.ts...
if exist "frontend\src\environments\environment.ts" (
    echo ✅ Environment file encontrado
    type frontend\src\environments\environment.ts | findstr "3000" > nul
    if !errorlevel!==0 (
        echo ✅ API URL configurada correctamente
    ) else (
        echo ⚠️  API URL puede estar mal configurada
    )
) else (
    echo ❌ Environment file no encontrado
)

echo.
echo 📋 PASO 7: Verificando versiones y dependencias...
echo ==================================================

echo 🔍 Verificando Node.js...
node --version 2>nul || echo ❌ Node.js no encontrado

echo 🔍 Verificando npm...
npm --version 2>nul || echo ❌ npm no encontrado

echo 🔍 Verificando Angular CLI...
ng version --skip-confirmation 2>nul | findstr "Angular CLI" || echo ⚠️  Angular CLI no encontrado globalmente

echo.
echo 📋 PASO 8: Generando reporte de estado...
echo =========================================

echo.
echo 📊 RESUMEN DEL DIAGNÓSTICO:
echo ===========================
echo.

:: Verificar estado de todos los servicios
set "backend_ok=0"
set "mongodb_ok=0"
set "frontend_ok=0"

curl -s http://localhost:3000/health > nul 2>&1
if !errorlevel!==0 set "backend_ok=1"

mongo --eval "db.runCommand('ping')" --quiet > nul 2>&1
if !errorlevel!==0 set "mongodb_ok=1"

curl -s http://localhost:4200 > nul 2>&1
if !errorlevel!==0 set "frontend_ok=1"

if !backend_ok!==1 (
    echo ✅ Backend: FUNCIONANDO
) else (
    echo ❌ Backend: NO FUNCIONA
)

if !mongodb_ok!==1 (
    echo ✅ MongoDB: FUNCIONANDO
) else (
    echo ❌ MongoDB: NO FUNCIONA
)

if !frontend_ok!==1 (
    echo ✅ Frontend: FUNCIONANDO
) else (
    echo ⚠️  Frontend: NO DETECTADO
)

echo.
echo 🎯 RECOMENDACIONES:
echo ===================

if !backend_ok!==0 (
    echo 1. ❗ CRÍTICO: Inicia el backend
    echo    cd backend ^&^& npm install ^&^& npm run start:dev
    echo.
)

if !mongodb_ok!==0 (
    echo 2. ❗ CRÍTICO: Inicia MongoDB
    echo    net start MongoDB
    echo    O ejecuta: mongod
    echo.
)

if !frontend_ok!==0 (
    echo 3. 💡 OPCIONAL: Para pruebas web, inicia el frontend
    echo    cd frontend ^&^& npm install ^&^& ng serve
    echo.
)

echo 4. 🧪 Una vez que los servicios estén funcionando:
echo    Ejecuta: node test-eliminacion-especifico.js
echo.
echo 5. 🌐 Para probar desde el navegador:
echo    Ve a http://localhost:4200 y prueba eliminar un fondo
echo    Abre F12 ^> Console para ver logs detallados
echo.

echo ==========================================
echo   DIAGNÓSTICO AVANZADO COMPLETADO
echo ==========================================
echo.
pause
