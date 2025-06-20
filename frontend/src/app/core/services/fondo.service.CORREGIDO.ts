import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Fondo, CreateFondoDto, UpdateFondoDto, TipoFondo } from '../models/fondo.model';

@Injectable({
  providedIn: 'root'
})
export class FondoService {
  private apiUrl = `${environment.apiUrl}/fondos`;
  private fondosSubject = new BehaviorSubject<Fondo[]>([]);
  public fondos$ = this.fondosSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerFondos(tipo?: string): Observable<Fondo[]> {
    console.log('Obteniendo fondos del backend...');
    
    let params = new HttpParams();
    if (tipo) {
      params = params.set('tipo', tipo);
    }

    return this.http.get<Fondo[]>(this.apiUrl, { params })
      .pipe(
        tap(fondos => {
          console.log('Fondos obtenidos exitosamente:', fondos);
          this.fondosSubject.next(fondos);
        }),
        catchError(error => {
          console.error('Error al obtener fondos - NO se usarán datos simulados:', error);
          
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
    console.log('Obteniendo fondo por ID:', id);
    
    return this.http.get<Fondo>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(fondo => {
          console.log('Fondo obtenido exitosamente:', fondo);
        }),
        catchError(error => {
          console.error('Error al obtener fondo por ID:', error);
          
          let mensaje = 'Error al cargar el fondo';
          if (error.status === 404) {
            mensaje = 'Fondo no encontrado';
          } else if (error.status === 401) {
            mensaje = 'No autorizado para ver este fondo';
          }
          
          return throwError(() => ({
            ...error,
            message: mensaje
          }));
        })
      );
  }

  crearFondo(fondo: CreateFondoDto): Observable<Fondo> {
    console.log('Creando nuevo fondo:', fondo);
    
    return this.http.post<Fondo>(this.apiUrl, fondo)
      .pipe(
        tap(nuevoFondo => {
          console.log('Fondo creado exitosamente:', nuevoFondo);
          const fondosActuales = this.fondosSubject.value;
          this.fondosSubject.next([...fondosActuales, nuevoFondo]);
        }),
        catchError(error => {
          console.error('Error al crear fondo:', error);
          
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
    console.log('Actualizando fondo:', id, fondo);
    
    return this.http.patch<Fondo>(`${this.apiUrl}/${id}`, fondo)
      .pipe(
        tap(fondoActualizado => {
          console.log('Fondo actualizado exitosamente:', fondoActualizado);
          const fondosActuales = this.fondosSubject.value;
          const index = fondosActuales.findIndex(f => f._id === id);
          if (index !== -1) {
            fondosActuales[index] = fondoActualizado;
            this.fondosSubject.next([...fondosActuales]);
          }
        }),
        catchError(error => {
          console.error('Error al actualizar fondo:', error);
          
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
    console.log('Eliminando fondo:', id);
    
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(response => {
          console.log('Fondo eliminado exitosamente:', response);
          const fondosActuales = this.fondosSubject.value;
          const fondosFiltrados = fondosActuales.filter(f => f._id !== id);
          this.fondosSubject.next(fondosFiltrados);
        }),
        catchError(error => {
          console.error('Error al eliminar fondo:', error);
          
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
    console.log('Obteniendo estadísticas del fondo:', id);
    
    return this.http.get<{
      totalTransacciones: number;
      totalIngresos: number;
      totalGastos: number;
      balance: number;
      progresoMeta: number;
      transaccionesRecientes: any[];
    }>(`${this.apiUrl}/${id}/estadisticas`)
      .pipe(
        tap(estadisticas => {
          console.log('Estadísticas obtenidas exitosamente:', estadisticas);
        }),
        catchError(error => {
          console.error('Error al obtener estadísticas:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerEstadisticasGenerales(): Observable<{
    totalFondos: number;
    fondosConMetas: number;
    metaPromedioAhorro: number;
  }> {
    console.log('Obteniendo estadísticas generales...');
    
    return this.http.get<{
      totalFondos: number;
      fondosConMetas: number;
      metaPromedioAhorro: number;
    }>(`${this.apiUrl}/estadisticas`)
      .pipe(
        tap(estadisticas => {
          console.log('Estadísticas generales obtenidas:', estadisticas);
        }),
        catchError(error => {
          console.error('Error al obtener estadísticas generales:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerTiposFondo(): TipoFondo[] {
    return ['ahorro', 'inversion', 'emergencia', 'gastos', 'personal'];
  }

  /**
   * Refrescar la lista de fondos desde el servidor
   */
  refrescarFondos(): Observable<Fondo[]> {
    return this.obtenerFondos();
  }

  /**
   * Limpiar el cache de fondos
   */
  limpiarCache(): void {
    this.fondosSubject.next([]);
  }
}
