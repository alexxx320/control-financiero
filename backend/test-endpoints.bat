@echo off
echo 🧪 Probando conectividad del backend...
echo.

echo 📡 Probando endpoint raíz (/)...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000/
echo.

echo 📡 Probando health endpoint (/health)...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000/health
echo.

echo 📡 Probando API health (/api/health)...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000/api/health
echo.

echo 📡 Probando endpoint de login (/api/auth/login)...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000/api/auth/login
echo.

echo 📡 Obteniendo respuesta del health endpoint...
curl -s http://localhost:3000/health
echo.
echo.

pause
