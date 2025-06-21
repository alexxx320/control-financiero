# 💰 Control Financiero

Sistema de control financiero personal desarrollado con **Angular 17** + **NestJS** + **MongoDB**.

## 🚀 Inicio Rápido

### 1. **Instalación Completa**
```bash
# Instalar todas las dependencias
setup.bat
```

### 2. **Iniciar Desarrollo**
```bash
# Iniciar backend + frontend automáticamente  
iniciar-dev.bat
```

### 3. **Acceder al Sistema**
- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000
- **Reportes**: http://localhost:4200/reportes

## 📊 Funcionalidades

### ✅ **Gestión de Fondos**
- Crear y administrar múltiples fondos
- Establecer metas de ahorro
- Categorización por tipos

### ✅ **Transacciones**
- Registro de ingresos y gastos
- Categorización automática
- Historial completo

### ✅ **Reportes Financieros**
- Dashboard ejecutivo con KPIs
- Alertas inteligentes
- Performance de fondos
- Exportación a PDF/Excel

### ✅ **Autenticación**
- Sistema de usuarios seguro
- JWT tokens
- Sesiones persistentes

## 🛠️ Tecnologías

### **Frontend**
- Angular 17
- Angular Material
- TypeScript
- SCSS

### **Backend**
- NestJS
- MongoDB + Mongoose
- JWT Authentication
- TypeScript

## 📁 Estructura del Proyecto

```
control-financiero/
├── 📁 frontend/          # Aplicación Angular
├── 📁 backend/           # API NestJS
├── 📁 scripts/           # Scripts de automatización
│   ├── instalacion/      # Scripts de instalación
│   ├── desarrollo/       # Scripts de desarrollo
│   └── correcciones/     # Scripts de correcciones
├── 📁 tests/             # Tests de APIs
├── 📁 docs/              # Documentación técnica
├── setup.bat             # Instalación rápida
├── iniciar-dev.bat       # Desarrollo rápido
└── README.md             # Este archivo
```

## 🔧 Scripts Disponibles

### **Uso Diario**
- `setup.bat` - Instalar todo el proyecto
- `iniciar-dev.bat` - Iniciar desarrollo

### **Instalación Manual**
- `scripts/instalacion/instalar-backend.bat`
- `scripts/instalacion/instalar-frontend.bat`

### **Correcciones** (si necesitas)
- `scripts/correcciones/solucion-reportes-completa.bat`
- `scripts/correcciones/diagnostico-avanzado.bat`

### **Testing**
- `tests/test-auth.js` - Prueba autenticación
- `tests/test-crud.js` - Prueba operaciones CRUD

## 🚨 Solución de Problemas

### **Problema: Backend no inicia**
```bash
cd backend
npm install
npm run start:dev
```

### **Problema: Frontend no compila**
```bash
cd frontend
npm install
ng serve
```

### **Problema: Base de datos**
- Verificar que MongoDB esté corriendo
- Revisar conexión en `backend/.env`

### **Problema: Reportes vacíos**
1. Crear fondos en `/fondos`
2. Agregar transacciones en `/transacciones`
3. Volver a `/reportes`

## 📚 Documentación Adicional

- **Solución Reportes**: `docs/SOLUCION-REPORTES-FINANCIEROS.md`
- **Correcciones**: `docs/CORRECCIONES.md`
- **Dashboard**: `docs/DASHBOARD-DATOS-REALES.md`

## 🎯 Flujo de Trabajo Recomendado

1. **Primera vez**: Ejecutar `setup.bat`
2. **Desarrollo**: Ejecutar `iniciar-dev.bat`
3. **Crear datos de prueba**:
   - Ir a `/fondos` y crear fondos
   - Ir a `/transacciones` y agregar transacciones
   - Ir a `/reportes` para ver análisis
4. **Debugging**: Usar tests en `tests/`

## 🔐 Configuración

### **Variables de Entorno** (backend/.env)
```env
MONGODB_URI=mongodb://localhost:27017/control-financiero
JWT_SECRET=tu_jwt_secret
PORT=3000
```

### **Proxy Frontend** (frontend/proxy.conf.json)
```json
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": true,
    "changeOrigin": true
  }
}
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 💡 Tips de Uso

### **Desarrollo Eficiente**
- Usar `iniciar-dev.bat` para desarrollo diario
- Los servidores se reinician automáticamente
- Hot reload activado en frontend

### **Testing Rápido**
- `node tests/test-auth.js` - Probar login
- `node tests/test-crud.js` - Probar APIs

### **Estructura de Datos**
- Un usuario puede tener múltiples fondos
- Cada fondo puede tener múltiples transacciones
- Las transacciones se categorizan automáticamente

---

**¡Listo para usar! 🎉**

Ejecuta `iniciar-dev.bat` y comienza a controlar tus finanzas.
