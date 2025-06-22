# 💰 Control Financiero Personal

Sistema completo de gestión financiera personal desarrollado con **Angular 17**, **NestJS** y **MongoDB**. Permite gestionar fondos, transacciones y generar reportes avanzados con análisis financiero en tiempo real.

## 🚀 Inicio Rápido

### 📋 Requisitos Previos
- Node.js v18+ y npm
- MongoDB (local o en la nube)
- Git

### 🛠️ Instalación

#### 1. **Clonar el Repositorio**
```bash
git clone <url-del-repositorio>
cd control-financiero
```

#### 2. **Configurar Backend**
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
```

#### 3. **Configurar Frontend**
```bash
cd ../frontend
npm install
```

#### 4. **Iniciar el Sistema**

**Backend (Terminal 1):**
```bash
cd backend
npm run start:dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

### 🌐 **Acceso al Sistema**
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api (Swagger)

## 🎯 Funcionalidades Principales

### 🏦 **Gestión de Fondos**
- ✅ Crear múltiples fondos de ahorro
- ✅ Establecer metas financieras
- ✅ Categorización por tipos (ahorro, inversión, gastos, etc.)
- ✅ Seguimiento de balances en tiempo real
- ✅ Estadísticas por fondo

### 💸 **Gestión de Transacciones**
- ✅ Registro de ingresos y gastos
- ✅ Categorización automática
- ✅ Asociación a fondos específicos
- ✅ Historial completo con filtros
- ✅ Edición y eliminación de transacciones

### 📊 **Reportes y Analytics**
- ✅ **Dashboard Ejecutivo** con KPIs en tiempo real
- ✅ **Reportes Mensuales y Anuales** detallados
- ✅ **Gráficos Interactivos** (Chart.js)
  - Tendencias de ingresos vs gastos
  - Análisis por períodos (semana, mes, trimestre, año)
  - Distribución por categorías
- ✅ **Alertas Financieras Inteligentes**
- ✅ **Exportación** a PDF y Excel
- ✅ **Análisis de Flujo de Caja**

### 🔐 **Autenticación y Seguridad**
- ✅ Sistema de usuarios con JWT
- ✅ Autenticación segura
- ✅ Sesiones persistentes
- ✅ Datos aislados por usuario

### 📱 **Interfaz de Usuario**
- ✅ **Diseño Responsivo** con Angular Material
- ✅ **Dark/Light Mode**
- ✅ **Navegación Intuitiva**
- ✅ **Formularios Reactivos**
- ✅ **Validaciones en Tiempo Real**

## 🏗️ Arquitectura del Sistema

### **Backend (NestJS)**
```
backend/src/
├── modules/
│   ├── auth/           # Autenticación JWT
│   ├── usuarios/       # Gestión de usuarios
│   ├── fondos/         # CRUD de fondos
│   ├── transacciones/  # CRUD de transacciones
│   └── reportes/       # Generación de reportes
├── common/
│   ├── dto/           # Data Transfer Objects
│   ├── guards/        # Guards de autenticación
│   └── decorators/    # Decoradores personalizados
└── main.ts           # Punto de entrada
```

### **Frontend (Angular 17)**
```
frontend/src/app/
├── features/
│   ├── auth/          # Login/Registro
│   ├── dashboard/     # Panel principal
│   ├── fondos/        # Gestión de fondos
│   ├── transacciones/ # Gestión de transacciones
│   └── reportes/      # Reportes y analytics
├── shared/
│   ├── components/    # Componentes reutilizables
│   ├── services/      # Servicios HTTP
│   └── guards/        # Guards de rutas
└── core/             # Configuración central
```

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **Angular 17** - Framework principal
- **Angular Material** - Componentes UI
- **Chart.js + ng2-charts** - Gráficos interactivos
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos avanzados
- **RxJS** - Programación reactiva

### **Backend**
- **NestJS** - Framework de Node.js
- **MongoDB + Mongoose** - Base de datos NoSQL
- **JWT + Passport** - Autenticación
- **Swagger** - Documentación de API
- **ExcelJS** - Exportación a Excel
- **PDFKit** - Generación de PDFs
- **bcryptjs** - Encriptación de contraseñas

### **DevOps & Tools**
- **TypeScript** - Tipado estático
- **ESLint + Prettier** - Calidad de código
- **Jest** - Testing unitario
- **Git** - Control de versiones

## 📁 Estructura del Proyecto

```
control-financiero/
├── 📁 backend/                # API NestJS
│   ├── src/
│   │   ├── modules/          # Módulos funcionales
│   │   ├── common/           # Utilidades compartidas
│   │   └── main.ts          # Bootstrap de la aplicación
│   ├── package.json         # Dependencias backend
│   └── .env.example        # Variables de entorno
├── 📁 frontend/              # Aplicación Angular
│   ├── src/
│   │   ├── app/            # Código de la aplicación
│   │   ├── assets/         # Recursos estáticos
│   │   └── environments/   # Configuraciones de entorno
│   ├── package.json       # Dependencias frontend
│   └── proxy.conf.json    # Configuración de proxy
├── .gitignore            # Archivos ignorados por Git
└── README.md            # Este archivo
```

## ⚙️ Configuración

### **Variables de Entorno (backend/.env)**
```env
# Puerto del servidor
PORT=3000

# Entorno de ejecución
NODE_ENV=development

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/control-financiero

# JWT para autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# CORS
CORS_ORIGIN=http://localhost:4200
```

### **Configuración de Proxy (frontend/proxy.conf.json)**
```json
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## 🧪 Testing y Desarrollo

### **Scripts de Desarrollo**

**Backend:**
```bash
npm run start:dev    # Modo desarrollo con hot reload
npm run build        # Compilar para producción
npm run test         # Ejecutar tests unitarios
npm run lint         # Verificar calidad de código
```

**Frontend:**
```bash
npm start           # Servidor de desarrollo
ng build            # Compilar aplicación
ng test             # Ejecutar tests unitarios
ng lint             # Verificar calidad de código
```

### **Testing**
- **Backend**: Jest para tests unitarios
- **Frontend**: Jasmine + Karma para tests unitarios
- Pruebas de integración con APIs reales

## 🚨 Solución de Problemas Comunes

### **Error: Backend no inicia**
```bash
# Verificar MongoDB
mongod --version

# Reinstalar dependencias
cd backend
rm -rf node_modules package-lock.json
npm install
```

### **Error: Frontend no compila**
```bash
# Limpiar caché de Angular
ng cache clean

# Reinstalar dependencias
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### **Error: CORS en desarrollo**
- Verificar que `proxy.conf.json` esté configurado
- Confirmar que el backend use el puerto 3000
- Revisar configuración CORS en `main.ts`

### **Error: Reportes vacíos**
1. Crear al menos un fondo en `/fondos`
2. Agregar transacciones en `/transacciones`
3. Verificar datos en `/reportes`

## 📈 Roadmap y Mejoras Futuras

### **Funcionalidades Planificadas**
- [ ] **Presupuestos** - Planificación financiera
- [ ] **Metas de Ahorro** - Seguimiento de objetivos
- [ ] **Categorías Personalizadas** - Mayor flexibilidad
- [ ] **Recordatorios** - Notificaciones automáticas
- [ ] **Exportación Avanzada** - Más formatos
- [ ] **API Mobile** - Aplicación móvil
- [ ] **Integración Bancaria** - Importación automática
- [ ] **Machine Learning** - Predicciones financieras

### **Mejoras Técnicas**
- [ ] **Docker** - Containerización
- [ ] **CI/CD** - Automatización de deploys
- [ ] **Tests E2E** - Cypress o Playwright
- [ ] **PWA** - Aplicación web progresiva
- [ ] **WebSockets** - Actualizaciones en tiempo real

## 🤝 Contribuir al Proyecto

### **Proceso de Contribución**
1. **Fork** el repositorio
2. **Crear rama feature**: `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollar** y **testear** los cambios
4. **Commit**: `git commit -m 'feat: agregar nueva funcionalidad'`
5. **Push**: `git push origin feature/nueva-funcionalidad`
6. **Crear Pull Request** con descripción detallada

### **Estándares de Código**
- Seguir convenciones de TypeScript
- Usar ESLint y Prettier
- Escribir tests para nuevas funcionalidades
- Documentar APIs con Swagger
- Commits con formato conventional

### **Reportar Issues**
- Usar plantillas de issues
- Incluir pasos para reproducir
- Especificar entorno y versiones
- Adjuntar logs si es necesario

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo de Desarrollo

- **Alex T** - Desarrollador Principal
- Contribuciones bienvenidas de la comunidad

## 📞 Soporte y Contacto

- **Issues**: [GitHub Issues](link-to-issues)
- **Documentación**: [Wiki del Proyecto](link-to-wiki)
- **Email**: contacto@control-financiero.com

---

## 💡 Tips de Uso Eficiente

### **Flujo de Trabajo Recomendado**
1. **Configurar Fondos** - Crear fondos básicos (ahorro, gastos, inversión)
2. **Registrar Transacciones** - Mantener historial actualizado
3. **Revisar Reportes** - Análisis semanal/mensual
4. **Exportar Datos** - Backups y análisis externo
5. **Establecer Metas** - Planificación financiera

### **Mejores Prácticas**
- **Consistencia**: Registrar transacciones diariamente
- **Categorización**: Usar categorías específicas y consistentes
- **Respaldos**: Exportar datos mensualmente
- **Análisis**: Revisar tendencias y patrones regularmente
- **Metas**: Establecer objetivos realistas y medibles

### **Shortcuts de Navegación**
- `Ctrl + D` - Dashboard principal
- `Ctrl + F` - Gestión de fondos
- `Ctrl + T` - Nueva transacción
- `Ctrl + R` - Reportes
- `Ctrl + E` - Exportar datos

---

**¡Sistema listo para gestionar tus finanzas! 🎉**

Para comenzar, inicia tanto el backend como el frontend y dirígete a http://localhost:4200