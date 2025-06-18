# Control Financiero - Frontend

Frontend desarrollado en Angular 17 para la aplicación de Control Financiero.

## Características

- **Dashboard:** Resumen visual de las finanzas personales
- **Gestión de Transacciones:** CRUD completo para ingresos y gastos
- **Gestión de Fondos:** Organización por tipos (ahorro, emergencia, etc.)
- **Reportes:** Análisis detallado con gráficos y estadísticas
- **Responsive Design:** Optimizado para desktop y móvil

## Tecnologías Utilizadas

- Angular 17 (Standalone Components)
- Angular Material 17
- Chart.js con ng2-charts
- RxJS para manejo de estado
- TypeScript
- Moment.js para fechas

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # Interfaces y tipos
│   │   └── services/        # Servicios HTTP
│   ├── features/
│   │   ├── dashboard/       # Componente principal
│   │   ├── transacciones/   # Gestión de transacciones
│   │   ├── fondos/          # Gestión de fondos
│   │   └── reportes/        # Reportes y estadísticas
│   ├── shared/
│   │   └── components/      # Componentes reutilizables
│   ├── app.component.ts     # Componente raíz
│   └── app.routes.ts        # Configuración de rutas
├── environments/            # Configuración de entornos
├── assets/                  # Recursos estáticos
└── styles.css              # Estilos globales
```

## Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar el entorno:**
   - Editar `src/environments/environment.ts`
   - Configurar la URL del backend (por defecto: `http://localhost:3000/api`)

3. **Ejecutar en desarrollo:**
   ```bash
   npm start
   # o
   ng serve
   ```

4. **Construir para producción:**
   ```bash
   npm run build:prod
   # o
   ng build --configuration production
   ```

## Scripts Disponibles

- `npm start` - Ejecutar servidor de desarrollo
- `npm run build` - Construir la aplicación
- `npm run build:prod` - Construir para producción
- `npm test` - Ejecutar pruebas unitarias
- `npm run watch` - Construir en modo watch

## Configuración de la API

El frontend se conecta al backend a través de las siguientes rutas:

- **Dashboard:** `/api/dashboard/*`
- **Transacciones:** `/api/transacciones/*`
- **Fondos:** `/api/fondos/*`

## Características Principales

### Dashboard
- Resumen financiero general
- Gráficos de ingresos vs gastos
- Progreso de fondos con barras de progreso
- Filtros por fechas

### Transacciones
- Lista paginada y filtrable
- Creación y edición de transacciones
- Filtros por fondo, tipo y categoría
- Indicadores visuales por tipo (ingreso/gasto)

### Fondos
- Gestión completa de fondos
- Diferentes tipos: ahorro, inversión, emergencia, gastos, personal
- Progreso visual hacia metas
- Activación/desactivación de fondos

### Reportes
- Reportes por períodos personalizables
- Análisis por categorías
- Tendencias temporales
- Exportación (en desarrollo)

## Navegación

La aplicación utiliza un menú lateral responsive con las siguientes secciones:

- **Dashboard** - Vista general
- **Transacciones** - Gestión de movimientos
- **Fondos** - Administración de fondos
- **Reportes** - Análisis y estadísticas

## Responsive Design

- **Desktop:** Layout completo con menú lateral fijo
- **Tablet:** Menú lateral colapsable
- **Móvil:** Menú overlay con navegación táctil

## Estado de Desarrollo

### ✅ Completado
- Estructura base de la aplicación
- Componentes principales
- Servicios HTTP
- Ruteo y navegación
- Design responsivo
- Integración con Angular Material

### 🚧 En Desarrollo
- Diálogos para crear/editar transacciones
- Reportes avanzados con más gráficos
- Funcionalidad de exportación
- Validaciones avanzadas de formularios

### 📋 Por Implementar
- Autenticación de usuarios
- Notificaciones push
- Modo offline
- Pruebas unitarias e integración
- Optimizaciones de performance

## Notas de Desarrollo

- Los componentes utilizan la arquitectura Standalone de Angular 17
- Se implementa lazy loading para optimizar la carga
- Los servicios manejan estados locales con BehaviorSubject
- Se utiliza el patrón OnPush para optimizar la detección de cambios

## Soporte

Para preguntas o problemas, revisar:
1. La documentación del backend
2. Los logs del navegador
3. La configuración de CORS en el backend
