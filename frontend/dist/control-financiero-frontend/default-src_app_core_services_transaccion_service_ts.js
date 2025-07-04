"use strict";
(self["webpackChunkcontrol_financiero_frontend"] = self["webpackChunkcontrol_financiero_frontend"] || []).push([["default-src_app_core_services_transaccion_service_ts"],{

/***/ 5435:
/*!******************************************************!*\
  !*** ./src/app/core/services/transaccion.service.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TransaccionService: () => (/* binding */ TransaccionService)
/* harmony export */ });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ 5797);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 9452);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ 271);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ 8764);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ 1318);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../environments/environment */ 5312);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ 7580);






class TransaccionService {
  constructor(http) {
    this.http = http;
    this.apiUrl = `${_environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.apiUrl}/transacciones`;
    this.transaccionesSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject([]);
    this.estadisticasSubject = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(null);
    this.transacciones$ = this.transaccionesSubject.asObservable();
    this.estadisticas$ = this.estadisticasSubject.asObservable();
  }
  /**
   * Obtener transacciones con filtros y paginación
   */
  obtenerTransacciones(filtros = {}) {
    let params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__.HttpParams();
    console.log('📋 Frontend - Filtros recibidos:', filtros);
    // Agregar parámetros de filtro
    Object.keys(filtros).forEach(key => {
      const value = filtros[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params = params.append(key, v));
        } else {
          params = params.set(key, value.toString());
        }
      }
    });
    console.log('🌐 Frontend - Parámetros HTTP enviados:', params.toString());
    console.log('🌐 Frontend - URL completa:', `${this.apiUrl}?${params.toString()}`);
    return this.http.get(this.apiUrl, {
      params
    }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.map)(response => {
      // Transformar respuesta del backend a formato esperado
      const transaccionesTransformadas = response.transacciones?.map(t => ({
        ...t,
        // Si fondoId es un objeto (populado), extraer solo el ID para consistency
        fondoId: typeof t.fondoId === 'object' && t.fondoId._id ? t.fondoId._id : t.fondoId,
        // Guardar el nombre del fondo si viene populado
        _fondoNombre: typeof t.fondoId === 'object' && t.fondoId.nombre ? t.fondoId.nombre : null
      })) || [];
      return {
        transacciones: transaccionesTransformadas,
        total: response.total || transaccionesTransformadas.length,
        page: response.page || 1,
        totalPages: response.totalPages || 1,
        resumen: response.resumen
      };
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(response => {
      console.log('✅ Transacciones del backend transformadas:', response);
      this.transaccionesSubject.next(response.transacciones);
      if (response.resumen) {
        this.actualizarEstadisticas(response.resumen);
      }
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
      console.error('❌ Error al obtener transacciones del backend:', error);
      // Solo usar datos simulados si es un error de conexión
      if (error.status === 0) {
        console.log('📊 Usando datos simulados como fallback por error de conexión...');
        return this.generarDatosSimulados(filtros);
      }
      // Para otros errores, devolver respuesta vacía
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.of)({
        transacciones: [],
        total: 0,
        page: 1,
        totalPages: 0
      });
    }));
  }
  /**
   * Obtener una transacción por ID
   */
  obtenerTransaccionPorId(id) {
    return this.http.get(`${this.apiUrl}/${id}`).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
      console.error('Error al obtener transacción:', error);
      throw error;
    }));
  }
  /**
   * Crear nueva transacción
   */
  crearTransaccion(transaccion) {
    return this.http.post(this.apiUrl, transaccion).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(nuevaTransaccion => {
      const transaccionesActuales = this.transaccionesSubject.value;
      this.transaccionesSubject.next([nuevaTransaccion, ...transaccionesActuales]);
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
      console.error('Error al crear transacción:', error);
      throw error;
    }));
  }
  /**
   * Crear una transferencia entre fondos
   */
  crearTransferencia(transferencia) {
    console.log('🔄 Frontend - Creando transferencia:', transferencia);
    console.log('🌐 Frontend - URL de transferencia:', `${this.apiUrl}/transferencia`);
    console.log('🌐 Frontend - API Base URL:', this.apiUrl);
    return this.http.post(`${this.apiUrl}/transferencia`, transferencia).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(response => {
      console.log('✅ Frontend - Transferencia creada exitosamente:', response);
      // Agregar ambas transacciones a la lista local
      const transaccionesActuales = this.transaccionesSubject.value;
      this.transaccionesSubject.next([response.transaccionOrigen, response.transaccionDestino, ...transaccionesActuales]);
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
      console.error('❌ Frontend - Error al crear transferencia:', error);
      console.error('❌ Frontend - Error status:', error.status);
      console.error('❌ Frontend - Error URL:', error.url);
      console.error('❌ Frontend - Error message:', error.message);
      let mensaje = 'Error al crear la transferencia';
      if (error.status === 400) {
        mensaje = error.error?.message || 'Datos de transferencia inválidos o saldo insuficiente';
      } else if (error.status === 404) {
        mensaje = 'Endpoint de transferencias no encontrado - Verificar que el backend esté ejecutándose';
      } else if (error.status === 401) {
        mensaje = 'No autorizado para realizar transferencias';
      } else if (error.status === 0) {
        mensaje = 'No se puede conectar con el servidor';
      }
      throw {
        ...error,
        message: mensaje
      };
    }));
  }
  /**
   * Actualizar transacción existente
   */
  actualizarTransaccion(id, transaccion) {
    console.log('🔄 Frontend - Actualizando transacción:', {
      id,
      transaccion
    });
    console.log('🔄 Frontend - URL completa:', `${this.apiUrl}/${id}`);
    return this.http.patch(`${this.apiUrl}/${id}`, transaccion).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(transaccionActualizada => {
      console.log('✅ Frontend - Transacción actualizada exitosamente:', transaccionActualizada);
      const transaccionesActuales = this.transaccionesSubject.value;
      const index = transaccionesActuales.findIndex(t => t._id === id);
      if (index !== -1) {
        transaccionesActuales[index] = transaccionActualizada;
        this.transaccionesSubject.next([...transaccionesActuales]);
        console.log('✅ Frontend - Lista de transacciones actualizada');
      } else {
        console.warn('⚠️ Frontend - No se encontró la transacción en la lista local para actualizar');
      }
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
      console.error('❌ Frontend - Error al actualizar transacción:', error);
      console.error('❌ Frontend - Error detalles:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        url: error.url
      });
      let mensaje = 'Error al actualizar la transacción';
      if (error.status === 404) {
        mensaje = 'Transacción no encontrada';
      } else if (error.status === 401) {
        mensaje = 'No autorizado para editar esta transacción';
      } else if (error.status === 400) {
        mensaje = error.error?.message || 'Datos de la transacción inválidos';
      } else if (error.status === 0) {
        mensaje = 'No se puede conectar con el servidor';
      }
      throw {
        ...error,
        message: mensaje
      };
    }));
  }
  /**
   * Eliminar transacción
   */
  eliminarTransaccion(id) {
    console.log('🗑️ Eliminando transacción:', id);
    return this.http.delete(`${this.apiUrl}/${id}`).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.tap)(response => {
      console.log('✅ Transacción eliminada exitosamente:', response);
      const transaccionesActuales = this.transaccionesSubject.value;
      const transaccionesFiltradas = transaccionesActuales.filter(t => t._id !== id);
      this.transaccionesSubject.next(transaccionesFiltradas);
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
      console.error('❌ Error al eliminar transacción:', error);
      throw error;
    }));
  }
  /**
   * Obtener todas las categorías disponibles
   */
  obtenerCategorias() {
    return [
    // Categorías de gastos
    'necesario', 'no_necesario',
    // Categorías de ingresos
    'salario', 'regalo', 'otros',
    // Categoría para transferencias
    'transferencia'];
  }
  /**
   * Obtener categorías filtradas por tipo
   */
  obtenerCategoriasPorTipo(tipo) {
    const categoriasGastos = ['necesario', 'no_necesario'];
    const categoriasIngresos = ['salario', 'regalo', 'otros'];
    const categoriasTransferencias = ['transferencia'];
    if (tipo === 'gasto') return categoriasGastos;
    if (tipo === 'ingreso') return categoriasIngresos;
    if (tipo === 'transferencia') return categoriasTransferencias;
    return [];
  }
  /**
   * Actualizar estadísticas internas
   */
  actualizarEstadisticas(resumen) {
    const estadisticas = {
      totalTransacciones: resumen.totalIngresos + resumen.totalGastos,
      totalIngresos: resumen.totalIngresos,
      totalGastos: resumen.totalGastos,
      balance: resumen.totalIngresos - resumen.totalGastos,
      promedioTransacciones: 0,
      categoriaMaxGasto: {
        categoria: '',
        monto: 0
      },
      categoriaMaxIngreso: {
        categoria: '',
        monto: 0
      },
      tendenciaMensual: []
    };
    this.estadisticasSubject.next(estadisticas);
  }
  /**
   * Obtener transacciones de un fondo específico
   */
  obtenerTransaccionesPorFondo(fondoId, limite = 10) {
    let params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_2__.HttpParams().set('limit', limite.toString()).set('ordenarPor', 'fecha').set('orden', 'desc'); // Más recientes primero
    return this.http.get(`${this.apiUrl}/fondo/${fondoId}`, {
      params
    }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.map)(transacciones => {
      // Transformar respuesta del backend
      return transacciones.map(t => ({
        ...t,
        fondoId: typeof t.fondoId === 'object' && t.fondoId._id ? t.fondoId._id : t.fondoId,
        _fondoNombre: typeof t.fondoId === 'object' && t.fondoId.nombre ? t.fondoId.nombre : null
      }));
    }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
      console.error('❌ Error al obtener transacciones del fondo:', error);
      // Fallback con datos simulados para el fondo específico
      if (error.status === 0) {
        console.log('📊 Usando datos simulados para el fondo:', fondoId);
        return this.generarDatosSimuladosPorFondo(fondoId, limite);
      }
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.of)([]);
    }));
  }
  /**
   * Generar datos simulados para un fondo específico
   */
  generarDatosSimuladosPorFondo(fondoId, limite) {
    const transaccionesSimuladas = [{
      _id: `trans_${fondoId}_1`,
      fondoId: fondoId,
      descripcion: 'Compras del supermercado',
      monto: 150000,
      tipo: 'gasto',
      categoria: 'necesario',
      fecha: new Date(),
      notas: 'Compras semanales'
    }, {
      _id: `trans_${fondoId}_2`,
      fondoId: fondoId,
      descripcion: 'Salario mensual',
      monto: 500000,
      tipo: 'ingreso',
      categoria: 'salario',
      fecha: new Date(Date.now() - 86400000),
      notas: 'Depósito inicial del fondo'
    }, {
      _id: `trans_${fondoId}_3`,
      fondoId: fondoId,
      descripcion: 'Entretenimiento - Cine',
      monto: 25000,
      tipo: 'gasto',
      categoria: 'no_necesario',
      fecha: new Date(Date.now() - 172800000) // Hace 2 días
    }, {
      _id: `trans_${fondoId}_4`,
      fondoId: fondoId,
      descripcion: 'Regalo de cumpleaños',
      monto: 200000,
      tipo: 'ingreso',
      categoria: 'regalo',
      fecha: new Date(Date.now() - 259200000) // Hace 3 días
    }, {
      _id: `trans_${fondoId}_5`,
      fondoId: fondoId,
      descripcion: 'Venta de artículos',
      monto: 35000,
      tipo: 'ingreso',
      categoria: 'otros',
      fecha: new Date(Date.now() - 345600000) // Hace 4 días
    }];
    return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.of)(transaccionesSimuladas.slice(0, limite));
  }
  generarDatosSimulados(filtros) {
    console.log('📊 Generando datos simulados de transacciones...');
    console.log('📊 Filtros aplicados a datos simulados:', filtros);
    // Obtener fondos del cache para usar IDs reales
    let fondosReales = [];
    try {
      const cache = localStorage.getItem('fondos_cache');
      if (cache) {
        fondosReales = JSON.parse(cache);
        console.log('📦 Fondos desde cache:', fondosReales);
      }
    } catch (e) {
      console.warn('Error leyendo cache de fondos');
    }
    // Si no hay fondos en cache, usar IDs que coincidan con los que viste
    const fondoId1 = fondosReales[0]?._id || '685393a3a9540bbd42b8aa7a';
    const fondoId2 = fondosReales[1]?._id || '685393a3a9540bbd42b8aa7b';
    const fondoId3 = fondosReales[2]?._id || '685393a3a9540bbd42b8aa7c';
    console.log('🏦 Usando fondoIds:', {
      fondoId1,
      fondoId2,
      fondoId3
    });
    const transaccionesSimuladas = [{
      _id: 'trans_1',
      fondoId: fondoId1,
      descripcion: 'Compras del supermercado',
      monto: 150000,
      tipo: 'gasto',
      categoria: 'necesario',
      fecha: new Date(),
      notas: 'Compras semanales',
      etiquetas: ['supermercado', 'semanal']
    }, {
      _id: 'trans_2',
      fondoId: fondoId2,
      descripcion: 'Salario mensual',
      monto: 2500000,
      tipo: 'ingreso',
      categoria: 'salario',
      fecha: new Date(),
      etiquetas: ['trabajo', 'mensual']
    }, {
      _id: 'trans_3',
      fondoId: fondoId1,
      descripcion: 'Videojuegos',
      monto: 45000,
      tipo: 'gasto',
      categoria: 'no_necesario',
      fecha: new Date(),
      notas: 'Entretenimiento'
    }, {
      _id: 'trans_4',
      fondoId: fondoId3,
      descripcion: 'Regalo familiar',
      monto: 800000,
      tipo: 'ingreso',
      categoria: 'regalo',
      fecha: new Date(),
      etiquetas: ['familia', 'especial']
    }, {
      _id: 'trans_5',
      fondoId: fondoId2,
      descripcion: 'Venta de productos',
      monto: 85000,
      tipo: 'ingreso',
      categoria: 'otros',
      fecha: new Date()
    }, {
      _id: 'trans_6',
      fondoId: fondoId3,
      descripcion: 'Medicamentos',
      monto: 75000,
      tipo: 'gasto',
      categoria: 'necesario',
      fecha: new Date(Date.now() - 86400000)
    }];
    console.log('📊 Transacciones antes de filtros:', transaccionesSimuladas.map(t => ({
      desc: t.descripcion,
      fondoId: t.fondoId
    })));
    // Aplicar filtros
    let transaccionesFiltradas = transaccionesSimuladas;
    if (filtros.tipo) {
      console.log('🔄 Aplicando filtro tipo:', filtros.tipo);
      transaccionesFiltradas = transaccionesFiltradas.filter(t => t.tipo === filtros.tipo);
    }
    if (filtros.categoria) {
      console.log('🔄 Aplicando filtro categoría:', filtros.categoria);
      transaccionesFiltradas = transaccionesFiltradas.filter(t => t.categoria === filtros.categoria);
    }
    if (filtros.fondoId) {
      console.log('🔄 Aplicando filtro fondo:', filtros.fondoId);
      console.log('🔄 Transacciones antes del filtro de fondo:', transaccionesFiltradas.map(t => ({
        desc: t.descripcion,
        fondoId: t.fondoId
      })));
      transaccionesFiltradas = transaccionesFiltradas.filter(t => t.fondoId === filtros.fondoId);
      console.log('🔄 Transacciones después del filtro de fondo:', transaccionesFiltradas.map(t => ({
        desc: t.descripcion,
        fondoId: t.fondoId
      })));
    }
    const responseSimulada = {
      transacciones: transaccionesFiltradas,
      total: transaccionesFiltradas.length,
      page: filtros.page || 1,
      totalPages: Math.ceil(transaccionesFiltradas.length / (filtros.limit || 10)),
      resumen: {
        totalIngresos: transaccionesFiltradas.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + t.monto, 0),
        totalGastos: transaccionesFiltradas.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + t.monto, 0),
        balance: 0,
        transaccionesPorCategoria: []
      }
    };
    responseSimulada.resumen.balance = responseSimulada.resumen.totalIngresos - responseSimulada.resumen.totalGastos;
    console.log('✅ Transacciones simuladas generadas:', responseSimulada);
    console.log('🏦 FondoIds en respuesta final:', transaccionesFiltradas.map(t => t.fondoId));
    this.transaccionesSubject.next(responseSimulada.transacciones);
    return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.of)(responseSimulada);
  }
  static {
    this.ɵfac = function TransaccionService_Factory(t) {
      return new (t || TransaccionService)(_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_2__.HttpClient));
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineInjectable"]({
      token: TransaccionService,
      factory: TransaccionService.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ })

}]);
//# sourceMappingURL=default-src_app_core_services_transaccion_service_ts.js.map