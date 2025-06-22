import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Transaccion, 
  CreateTransaccionDto, 
  UpdateTransaccionDto, 
  TipoTransaccion, 
  CategoriaTransaccion,
  FiltroTransacciones,
  ResponseTransacciones,
  EstadisticasTransacciones
} from '../models/transaccion.model';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
  private apiUrl = `${environment.apiUrl}/transacciones`;
  private transaccionesSubject = new BehaviorSubject<Transaccion[]>([]);
  private estadisticasSubject = new BehaviorSubject<EstadisticasTransacciones | null>(null);
  
  public transacciones$ = this.transaccionesSubject.asObservable();
  public estadisticas$ = this.estadisticasSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener transacciones con filtros y paginación
   */
  obtenerTransacciones(filtros: FiltroTransacciones = {}): Observable<ResponseTransacciones> {
    let params = new HttpParams();
    
    console.log('📋 Frontend - Filtros recibidos:', filtros);
    
    // Agregar parámetros de filtro
    Object.keys(filtros).forEach(key => {
      const value = (filtros as any)[key];
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

    return this.http.get<any>(this.apiUrl, { params })
      .pipe(
        map(response => {
          // Transformar respuesta del backend a formato esperado
          const transaccionesTransformadas = response.transacciones?.map((t: any) => ({
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
          } as ResponseTransacciones;
        }),
        tap(response => {
          console.log('✅ Transacciones del backend transformadas:', response);
          this.transaccionesSubject.next(response.transacciones);
          if (response.resumen) {
            this.actualizarEstadisticas(response.resumen);
          }
        }),
        catchError(error => {
          console.error('❌ Error al obtener transacciones del backend:', error);
          
          // Solo usar datos simulados si es un error de conexión
          if (error.status === 0) {
            console.log('📊 Usando datos simulados como fallback por error de conexión...');
            return this.generarDatosSimulados(filtros);
          }
          
          // Para otros errores, devolver respuesta vacía
          return of({
            transacciones: [],
            total: 0,
            page: 1,
            totalPages: 0
          } as ResponseTransacciones);
        })
      );
  }

  /**
   * Obtener una transacción por ID
   */
  obtenerTransaccionPorId(id: string): Observable<Transaccion> {
    return this.http.get<Transaccion>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener transacción:', error);
          throw error;
        })
      );
  }

  /**
   * Crear nueva transacción
   */
  crearTransaccion(transaccion: CreateTransaccionDto): Observable<Transaccion> {
    return this.http.post<Transaccion>(this.apiUrl, transaccion)
      .pipe(
        tap(nuevaTransaccion => {
          const transaccionesActuales = this.transaccionesSubject.value;
          this.transaccionesSubject.next([nuevaTransaccion, ...transaccionesActuales]);
        }),
        catchError(error => {
          console.error('Error al crear transacción:', error);
          throw error;
        })
      );
  }

  /**
   * Actualizar transacción existente
   */
  actualizarTransaccion(id: string, transaccion: UpdateTransaccionDto): Observable<Transaccion> {
    console.log('🔄 Frontend - Actualizando transacción:', { id, transaccion });
    console.log('🔄 Frontend - URL completa:', `${this.apiUrl}/${id}`);
    
    return this.http.patch<Transaccion>(`${this.apiUrl}/${id}`, transaccion)
      .pipe(
        tap(transaccionActualizada => {
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
        }),
        catchError(error => {
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
          
          throw { ...error, message: mensaje };
        })
      );
  }

  /**
   * Eliminar transacción
   */
  eliminarTransaccion(id: string): Observable<{message: string}> {
    console.log('🗑️ Eliminando transacción:', id);
    
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`)
      .pipe(
        tap((response) => {
          console.log('✅ Transacción eliminada exitosamente:', response);
          const transaccionesActuales = this.transaccionesSubject.value;
          const transaccionesFiltradas = transaccionesActuales.filter(t => t._id !== id);
          this.transaccionesSubject.next(transaccionesFiltradas);
        }),
        catchError(error => {
          console.error('❌ Error al eliminar transacción:', error);
          throw error;
        })
      );
  }

  /**
   * Obtener todas las categorías disponibles
   */
  obtenerCategorias(): CategoriaTransaccion[] {
    return [
      // Categorías de gastos
      'necesario',
      'no_necesario',
      // Categorías de ingresos
      'salario',
      'regalo',
      'otros'
    ];
  }

  /**
   * Obtener categorías filtradas por tipo
   */
  obtenerCategoriasPorTipo(tipo: TipoTransaccion): CategoriaTransaccion[] {
    const categoriasGastos: CategoriaTransaccion[] = [
      'necesario', 'no_necesario'
    ];
    
    const categoriasIngresos: CategoriaTransaccion[] = [
      'salario', 'regalo', 'otros'
    ];
    
    return tipo === 'gasto' ? categoriasGastos : categoriasIngresos;
  }

  /**
   * Actualizar estadísticas internas
   */
  private actualizarEstadisticas(resumen: any): void {
    const estadisticas: EstadisticasTransacciones = {
      totalTransacciones: resumen.totalIngresos + resumen.totalGastos,
      totalIngresos: resumen.totalIngresos,
      totalGastos: resumen.totalGastos,
      balance: resumen.totalIngresos - resumen.totalGastos,
      promedioTransacciones: 0,
      categoriaMaxGasto: { categoria: '', monto: 0 },
      categoriaMaxIngreso: { categoria: '', monto: 0 },
      tendenciaMensual: []
    };
    
    this.estadisticasSubject.next(estadisticas);
  }

  /**
   * Obtener transacciones de un fondo específico
   */
  obtenerTransaccionesPorFondo(fondoId: string, limite: number = 10): Observable<Transaccion[]> {
    let params = new HttpParams()
      .set('limit', limite.toString())
      .set('ordenarPor', 'fecha')
      .set('orden', 'desc'); // Más recientes primero

    return this.http.get<Transaccion[]>(`${this.apiUrl}/fondo/${fondoId}`, { params })
      .pipe(
        map(transacciones => {
          // Transformar respuesta del backend
          return transacciones.map((t: any) => ({
            ...t,
            fondoId: typeof t.fondoId === 'object' && t.fondoId._id ? t.fondoId._id : t.fondoId,
            _fondoNombre: typeof t.fondoId === 'object' && t.fondoId.nombre ? t.fondoId.nombre : null
          }));
        }),
        catchError(error => {
          console.error('❌ Error al obtener transacciones del fondo:', error);
          
          // Fallback con datos simulados para el fondo específico
          if (error.status === 0) {
            console.log('📊 Usando datos simulados para el fondo:', fondoId);
            return this.generarDatosSimuladosPorFondo(fondoId, limite);
          }
          
          return of([]);
        })
      );
  }

  /**
   * Generar datos simulados para un fondo específico
   */
  private generarDatosSimuladosPorFondo(fondoId: string, limite: number): Observable<Transaccion[]> {
    const transaccionesSimuladas: Transaccion[] = [
      {
        _id: `trans_${fondoId}_1`,
        fondoId: fondoId,
        descripcion: 'Compras del supermercado',
        monto: 150000,
        tipo: 'gasto',
        categoria: 'necesario',
        fecha: new Date(),
        notas: 'Compras semanales'
      },
      {
        _id: `trans_${fondoId}_2`,
        fondoId: fondoId,
        descripcion: 'Salario mensual',
        monto: 500000,
        tipo: 'ingreso',
        categoria: 'salario',
        fecha: new Date(Date.now() - 86400000), // Ayer
        notas: 'Depósito inicial del fondo'
      },
      {
        _id: `trans_${fondoId}_3`,
        fondoId: fondoId,
        descripcion: 'Entretenimiento - Cine',
        monto: 25000,
        tipo: 'gasto',
        categoria: 'no_necesario',
        fecha: new Date(Date.now() - 172800000), // Hace 2 días
      },
      {
        _id: `trans_${fondoId}_4`,
        fondoId: fondoId,
        descripcion: 'Regalo de cumpleaños',
        monto: 200000,
        tipo: 'ingreso',
        categoria: 'regalo',
        fecha: new Date(Date.now() - 259200000), // Hace 3 días
      },
      {
        _id: `trans_${fondoId}_5`,
        fondoId: fondoId,
        descripcion: 'Venta de artículos',
        monto: 35000,
        tipo: 'ingreso',
        categoria: 'otros',
        fecha: new Date(Date.now() - 345600000), // Hace 4 días
      }
    ];

    return of(transaccionesSimuladas.slice(0, limite));
  }
  private generarDatosSimulados(filtros: FiltroTransacciones): Observable<ResponseTransacciones> {
    console.log('📊 Generando datos simulados de transacciones...');
    console.log('📊 Filtros aplicados a datos simulados:', filtros);
    
    // Obtener fondos del cache para usar IDs reales
    let fondosReales: any[] = [];
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
    
    console.log('🏦 Usando fondoIds:', { fondoId1, fondoId2, fondoId3 });
    
    const transaccionesSimuladas: Transaccion[] = [
      {
        _id: 'trans_1',
        fondoId: fondoId1,
        descripcion: 'Compras del supermercado',
        monto: 150000,
        tipo: 'gasto',
        categoria: 'necesario',
        fecha: new Date(),
        notas: 'Compras semanales',
        etiquetas: ['supermercado', 'semanal']
      },
      {
        _id: 'trans_2',
        fondoId: fondoId2, // Diferente fondo
        descripcion: 'Salario mensual',
        monto: 2500000,
        tipo: 'ingreso',
        categoria: 'salario',
        fecha: new Date(),
        etiquetas: ['trabajo', 'mensual']
      },
      {
        _id: 'trans_3',
        fondoId: fondoId1,
        descripcion: 'Videojuegos',
        monto: 45000,
        tipo: 'gasto',
        categoria: 'no_necesario',
        fecha: new Date(),
        notas: 'Entretenimiento'
      },
      {
        _id: 'trans_4',
        fondoId: fondoId3, // Tercer fondo
        descripcion: 'Regalo familiar',
        monto: 800000,
        tipo: 'ingreso',
        categoria: 'regalo',
        fecha: new Date(),
        etiquetas: ['familia', 'especial']
      },
      {
        _id: 'trans_5',
        fondoId: fondoId2, // Segundo fondo
        descripcion: 'Venta de productos',
        monto: 85000,
        tipo: 'ingreso',
        categoria: 'otros',
        fecha: new Date()
      },
      {
        _id: 'trans_6',
        fondoId: fondoId3,
        descripcion: 'Medicamentos',
        monto: 75000,
        tipo: 'gasto',
        categoria: 'necesario',
        fecha: new Date(Date.now() - 86400000)
      }
    ];

    console.log('📊 Transacciones antes de filtros:', transaccionesSimuladas.map(t => ({ desc: t.descripcion, fondoId: t.fondoId })));

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
      console.log('🔄 Transacciones antes del filtro de fondo:', transaccionesFiltradas.map(t => ({ desc: t.descripcion, fondoId: t.fondoId })));
      transaccionesFiltradas = transaccionesFiltradas.filter(t => t.fondoId === filtros.fondoId);
      console.log('🔄 Transacciones después del filtro de fondo:', transaccionesFiltradas.map(t => ({ desc: t.descripcion, fondoId: t.fondoId })));
    }

    const responseSimulada: ResponseTransacciones = {
      transacciones: transaccionesFiltradas,
      total: transaccionesFiltradas.length,
      page: filtros.page || 1,
      totalPages: Math.ceil(transaccionesFiltradas.length / (filtros.limit || 10)),
      resumen: {
        totalIngresos: transaccionesFiltradas
          .filter(t => t.tipo === 'ingreso')
          .reduce((sum, t) => sum + t.monto, 0),
        totalGastos: transaccionesFiltradas
          .filter(t => t.tipo === 'gasto')
          .reduce((sum, t) => sum + t.monto, 0),
        balance: 0,
        transaccionesPorCategoria: []
      }
    };

    responseSimulada.resumen!.balance = 
      responseSimulada.resumen!.totalIngresos - responseSimulada.resumen!.totalGastos;

    console.log('✅ Transacciones simuladas generadas:', responseSimulada);
    console.log('🏦 FondoIds en respuesta final:', transaccionesFiltradas.map(t => t.fondoId));
    
    this.transaccionesSubject.next(responseSimulada.transacciones);
    return of(responseSimulada);
  }
}
