import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
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

    return this.http.get<ResponseTransacciones>(this.apiUrl, { params })
      .pipe(
        tap(response => {
          this.transaccionesSubject.next(response.transacciones);
          if (response.resumen) {
            this.actualizarEstadisticas(response.resumen);
          }
        }),
        catchError(error => {
          console.error('Error al obtener transacciones:', error);
          return this.generarDatosSimulados(filtros);
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
    return this.http.patch<Transaccion>(`${this.apiUrl}/${id}`, transaccion)
      .pipe(
        tap(transaccionActualizada => {
          const transaccionesActuales = this.transaccionesSubject.value;
          const index = transaccionesActuales.findIndex(t => t._id === id);
          if (index !== -1) {
            transaccionesActuales[index] = transaccionActualizada;
            this.transaccionesSubject.next([...transaccionesActuales]);
          }
        }),
        catchError(error => {
          console.error('Error al actualizar transacción:', error);
          throw error;
        })
      );
  }

  /**
   * Eliminar transacción
   */
  eliminarTransaccion(id: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const transaccionesActuales = this.transaccionesSubject.value;
          const transaccionesFiltradas = transaccionesActuales.filter(t => t._id !== id);
          this.transaccionesSubject.next(transaccionesFiltradas);
        }),
        catchError(error => {
          console.error('Error al eliminar transacción:', error);
          throw error;
        })
      );
  }

  /**
   * Obtener transacciones de un fondo específico
   */
  obtenerTransaccionesPorFondo(
    fondoId: string, 
    filtros: FiltroTransacciones = {}
  ): Observable<Transaccion[]> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = (filtros as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<Transaccion[]>(`${this.apiUrl}/fondo/${fondoId}`, { params })
      .pipe(
        catchError(error => {
          console.error('Error al obtener transacciones por fondo:', error);
          throw error;
        })
      );
  }

  /**
   * Obtener todas las categorías disponibles
   */
  obtenerCategorias(): CategoriaTransaccion[] {
    return [
      'alimentacion',
      'transporte',
      'salud', 
      'entretenimiento',
      'educacion',
      'servicios',
      'shopping',
      'vivienda',
      'seguros',
      'salario',
      'freelance',
      'inversion',
      'regalo',
      'venta',
      'otros'
    ];
  }

  /**
   * Obtener categorías filtradas por tipo
   */
  obtenerCategoriasPorTipo(tipo: TipoTransaccion): CategoriaTransaccion[] {
    const categoriasGastos: CategoriaTransaccion[] = [
      'alimentacion', 'transporte', 'salud', 'entretenimiento', 
      'educacion', 'servicios', 'shopping', 'vivienda', 'seguros', 'otros'
    ];
    
    const categoriasIngresos: CategoriaTransaccion[] = [
      'salario', 'freelance', 'inversion', 'regalo', 'venta', 'otros'
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
   * Generar datos simulados para desarrollo
   */
  private generarDatosSimulados(filtros: FiltroTransacciones): Observable<ResponseTransacciones> {
    const transaccionesSimuladas: Transaccion[] = [
      {
        _id: '1',
        fondoId: '1',
        descripcion: 'Compra de mercado',
        monto: 150000,
        tipo: 'gasto',
        categoria: 'alimentacion',
        fecha: new Date(),
        notas: 'Compras del mes',
        etiquetas: ['supermercado', 'mensual']
      },
      {
        _id: '2',
        fondoId: '2',
        descripcion: 'Salario mensual',
        monto: 2500000,
        tipo: 'ingreso',
        categoria: 'salario',
        fecha: new Date(),
        etiquetas: ['trabajo', 'mensual']
      },
      {
        _id: '3',
        fondoId: '1',
        descripcion: 'Transporte público',
        monto: 45000,
        tipo: 'gasto',
        categoria: 'transporte',
        fecha: new Date(),
        notas: 'Semana laboral'
      },
      {
        _id: '4',
        fondoId: '3',
        descripcion: 'Freelance proyecto web',
        monto: 800000,
        tipo: 'ingreso',
        categoria: 'freelance',
        fecha: new Date(),
        etiquetas: ['proyecto', 'web']
      },
      {
        _id: '5',
        fondoId: '1',
        descripcion: 'Cena restaurante',
        monto: 85000,
        tipo: 'gasto',
        categoria: 'entretenimiento',
        fecha: new Date()
      }
    ];

    // Aplicar filtros básicos
    let transaccionesFiltradas = transaccionesSimuladas;
    
    if (filtros.tipo) {
      transaccionesFiltradas = transaccionesFiltradas.filter(t => t.tipo === filtros.tipo);
    }
    
    if (filtros.categoria) {
      transaccionesFiltradas = transaccionesFiltradas.filter(t => t.categoria === filtros.categoria);
    }
    
    if (filtros.fondoId) {
      transaccionesFiltradas = transaccionesFiltradas.filter(t => t.fondoId === filtros.fondoId);
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

    this.transaccionesSubject.next(responseSimulada.transacciones);
    return of(responseSimulada);
  }
}
