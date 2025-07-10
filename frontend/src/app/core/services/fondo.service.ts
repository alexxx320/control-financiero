import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Fondo, CreateFondoDto, UpdateFondoDto, TipoFondo, EstadisticasPrestamos, ProgresoPrestamo, EstadisticasDeudas, ProgresoDeuda } from '../models/fondo.model';

@Injectable({
  providedIn: 'root'
})
export class FondoService {
  private apiUrl = `${environment.apiUrl}/fondos`;
  private fondosSubject = new BehaviorSubject<Fondo[]>([]);
  public fondos$ = this.fondosSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerFondos(tipo?: string, incluirInactivos: boolean = false): Observable<Fondo[]> {
    console.log('🏦 Obteniendo fondos del backend...');
    
    let params = new HttpParams();
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    if (incluirInactivos) {
      params = params.set('incluirInactivos', 'true');
    }

    return this.http.get<Fondo[]>(this.apiUrl, { params })
      .pipe(
        tap(fondos => {
          console.log('✅ Fondos obtenidos exitosamente:', fondos);
          this.fondosSubject.next(fondos);
          
          // Guardar en localStorage para que transacciones los puedan usar
          localStorage.setItem('fondos_cache', JSON.stringify(fondos));
        }),
        catchError(error => {
          console.error('❌ Error al obtener fondos - NO se usarán datos simulados:', error);
          
          let mensaje = 'Error al cargar fondos';
          if (error.status === 0) {
            mensaje = 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.';
          } else if (error.status === 401) {
            mensaje = 'No autorizado. Tu sesión puede haber expirado.';
          } else if (error.status === 500) {
            mensaje = 'Error del servidor. Verifica que MongoDB esté ejecutándose.';
          }
          
          return throwError(() => ({
            ...error,
            message: mensaje
          }));
        })
      );
  }

  obtenerFondoPorId(id: string): Observable<Fondo> {
    return this.http.get<Fondo>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener fondo:', error);
          throw error;
        })
      );
  }

  crearFondo(fondo: CreateFondoDto): Observable<Fondo> {
    console.log('💾 Creando nuevo fondo:', fondo);
    
    return this.http.post<Fondo>(this.apiUrl, fondo)
      .pipe(
        tap(nuevoFondo => {
          console.log('✅ Fondo creado exitosamente:', nuevoFondo);
          const fondosActuales = this.fondosSubject.value;
          this.fondosSubject.next([...fondosActuales, nuevoFondo]);
        }),
        catchError(error => {
          console.error('❌ Error al crear fondo:', error);
          
          let mensaje = 'Error al crear el fondo';
          if (error.status === 400) {
            mensaje = error.error?.message || 'Datos del fondo inválidos';
          } else if (error.status === 401) {
            mensaje = 'No autorizado para crear fondos';
          } else if (error.status === 500) {
            mensaje = 'Error del servidor. Verifica que MongoDB esté ejecutándose.';
          }
          
          return throwError(() => ({
            ...error,
            message: mensaje
          }));
        })
      );
  }

  actualizarFondo(id: string, fondo: UpdateFondoDto): Observable<Fondo> {
    console.log('✏️ Actualizando fondo:', id, fondo);
    
    return this.http.patch<Fondo>(`${this.apiUrl}/${id}`, fondo)
      .pipe(
        tap(fondoActualizado => {
          console.log('✅ Fondo actualizado exitosamente:', fondoActualizado);
          const fondosActuales = this.fondosSubject.value;
          const index = fondosActuales.findIndex(f => f._id === id);
          if (index !== -1) {
            fondosActuales[index] = fondoActualizado;
            this.fondosSubject.next([...fondosActuales]);
          }
        }),
        catchError(error => {
          console.error('❌ Error al actualizar fondo:', error);
          
          let mensaje = 'Error al actualizar el fondo';
          if (error.status === 400) {
            mensaje = error.error?.message || 'Datos del fondo inválidos';
          } else if (error.status === 404) {
            mensaje = 'Fondo no encontrado';
          } else if (error.status === 401) {
            mensaje = 'No autorizado para editar este fondo';
          }
          
          return throwError(() => ({
            ...error,
            message: mensaje
          }));
        })
      );
  }

  eliminarFondo(id: string): Observable<{message: string}> {
    console.log('🗑️ Eliminando fondo:', id);
    
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(response => {
          console.log('✅ Fondo eliminado exitosamente:', response);
          const fondosActuales = this.fondosSubject.value;
          const fondosFiltrados = fondosActuales.filter(f => f._id !== id);
          this.fondosSubject.next(fondosFiltrados);
        }),
        catchError(error => {
          console.error('❌ Error al eliminar fondo:', error);
          
          let mensaje = 'Error al eliminar el fondo';
          if (error.status === 404) {
            mensaje = 'Fondo no encontrado';
          } else if (error.status === 401) {
            mensaje = 'No autorizado para eliminar este fondo';
          }
          
          return throwError(() => ({
            ...error,
            message: mensaje
          }));
        })
      );
  }

  obtenerEstadisticasFondo(id: string): Observable<{
    totalTransacciones: number;
    totalIngresos: number;
    totalGastos: number;
    balance: number;
    progresoMeta: number;
    transaccionesRecientes: any[];
  }> {
    return this.http.get<{
      totalTransacciones: number;
      totalIngresos: number;
      totalGastos: number;
      balance: number;
      progresoMeta: number;
      transaccionesRecientes: any[];
    }>(`${this.apiUrl}/${id}/estadisticas`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener estadísticas:', error);
          throw error;
        })
      );
  }

  obtenerEstadisticasGenerales(): Observable<{
    totalFondos: number;
    fondosConMetas: number;
    metaPromedioAhorro: number;
  }> {
    return this.http.get<{
      totalFondos: number;
      fondosConMetas: number;
      metaPromedioAhorro: number;
    }>(`${this.apiUrl}/estadisticas`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener estadísticas generales:', error);
          throw error;
        })
      );
  }

  // 🔧 MODIFICADO: Cuatro tipos de fondo incluyen deudas
  obtenerTiposFondo(): TipoFondo[] {
    return ['registro', 'ahorro', 'prestamo', 'deuda'];
  }

  // Métodos específicos para préstamos
  obtenerEstadisticasPrestamos(): Observable<EstadisticasPrestamos> {
    return this.http.get<EstadisticasPrestamos>(`${this.apiUrl}/estadisticas/prestamos`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener estadísticas de préstamos:', error);
          throw error;
        })
      );
  }

  obtenerProgresoPrestamo(fondoId: string): Observable<ProgresoPrestamo> {
    return this.http.get<ProgresoPrestamo>(`${this.apiUrl}/${fondoId}/progreso-prestamo`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener progreso del préstamo:', error);
          throw error;
        })
      );
  }

  // Utilidad para obtener solo préstamos
  obtenerPrestamos(): Observable<Fondo[]> {
    return this.obtenerFondos('prestamo');
  }

  // 🆕 NUEVO: Obtener fondos incluyendo inactivos (para administración)
  obtenerTodosLosFondos(): Observable<Fondo[]> {
    return this.obtenerFondos(undefined, true); // Incluir inactivos
  }

  // 🆕 NUEVO: Métodos específicos para deudas
  obtenerEstadisticasDeudas(): Observable<EstadisticasDeudas> {
    return this.http.get<EstadisticasDeudas>(`${this.apiUrl}/estadisticas/deudas`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener estadísticas de deudas:', error);
          throw error;
        })
      );
  }

  obtenerProgresoDeuda(fondoId: string): Observable<ProgresoDeuda> {
    return this.http.get<ProgresoDeuda>(`${this.apiUrl}/${fondoId}/progreso-deuda`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener progreso de la deuda:', error);
          throw error;
        })
      );
  }

  // Utilidad para obtener solo deudas
  obtenerDeudas(): Observable<Fondo[]> {
    return this.obtenerFondos('deuda');
  }

  // 🆕 NUEVO: Método para cambiar estado activo/inactivo
  toggleEstadoFondo(id: string): Observable<{ fondo: Fondo; message: string }> {
    console.log('🔄 Cambiando estado del fondo:', id);
    
    return this.http.patch<{ fondo: Fondo; message: string }>(`${this.apiUrl}/${id}/toggle-estado`, {})
      .pipe(
        tap(response => {
          console.log('✅ Estado del fondo cambiado exitosamente:', response);
          
          // Actualizar el fondo en el subject
          const fondosActuales = this.fondosSubject.value;
          const index = fondosActuales.findIndex(f => f._id === id);
          if (index !== -1) {
            fondosActuales[index] = response.fondo;
            this.fondosSubject.next([...fondosActuales]);
          }
        }),
        catchError(error => {
          console.error('❌ Error al cambiar estado del fondo:', error);
          
          let mensaje = 'Error al cambiar el estado del fondo';
          if (error.status === 404) {
            mensaje = 'Fondo no encontrado';
          } else if (error.status === 401) {
            mensaje = 'No autorizado para modificar este fondo';
          }
          
          return throwError(() => ({
            ...error,
            message: mensaje
          }));
        })
      );
  }
}
