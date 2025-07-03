# 🔧 Solución de Dependencias - Control Financiero Backend

## 📋 Problema
El backend no puede encontrar los módulos:
- cookie-parser
- helmet  
- express-rate-limit

## ✅ Solución Paso a Paso

### Paso 1: Instalar Dependencias

**Opción A - Automático (Recomendado):**
```powershell
# En PowerShell como Administrador
cd backend
.\install-deps.ps1
```

**Opción B - Manual:**
```bash
cd backend
npm install cookie-parser@^1.4.6 helmet@^7.0.0 express-rate-limit@^6.7.0
npm install --save-dev @types/cookie-parser@^1.4.4
```

### Paso 2: Activar Seguridad Completa

Después de instalar las dependencias, reemplaza el contenido de `src/main.ts` con `src/main-with-security.ts`:

```bash
# Backup del archivo actual
cp src/main.ts src/main-backup.ts

# Usar la versión con seguridad completa
cp src/main-with-security.ts src/main.ts
```

### Paso 3: Verificar Instalación

```bash
npm run start:dev
```

## 🎯 Estado Actual

✅ **Funcionando sin dependencias de seguridad:**
- Sistema JWT con access/refresh tokens
- Autenticación con cookies HttpOnly
- Control de dispositivos
- Renovación automática

⏳ **Pendiente (después de instalar dependencias):**
- Helmet para headers de seguridad
- Rate limiting para protección DDoS
- Cookie parser para manejo seguro

## 🚨 Notas Importantes

1. **El sistema JWT YA FUNCIONA** sin estas dependencias
2. Las dependencias de seguridad son **mejoras adicionales**
3. Puedes desarrollar y probar **inmediatamente** con la versión actual
4. Instala las dependencias cuando sea conveniente

## 🔄 Si persisten errores

1. Eliminar node_modules y reinstalar:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Verificar versión de Node.js:
```bash
node --version  # Debe ser v18+
npm --version   # Debe ser v9+
```

3. Limpiar caché de npm:
```bash
npm cache clean --force
```
