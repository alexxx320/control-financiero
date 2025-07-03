import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Prestamo, 
  PagoPrestamo, 
  CreatePrestamoDto, 
  UpdatePrestamoDto, 
  CreatePagoPrestamoDto,
  EstadisticasPrestamos,
  ResumenDeudor,
  EstadoPrestamo
} from '../models/prestamo.model';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {
  private apiUrl = `${environment.apiUrl}/prestamos`;
  
  // Subject para mantener el estado de los préstamos
  private prestamosSubject = new BehaviorSubject<Prestamo[]>([]);
  public prestamos$ = this.prestamosSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ===== GESTIÓN DE PRÉSTAMOS =====

  crearPrestamo(createPrestamoDto: CreatePrestamoDto): Observable<Prestamo> {
    console.log('💰 [PRESTAMO-SERVICE] Creando préstamo:', createPrestamoDto);
    
    return this.http.post<Prestamo>(this.apiUrl, createPrestamoDto).pipe(
      tap(prestamo => {
        console.log('✅ [PRESTAMO-SERVICE] Préstamo creado:', prestamo);
        this.cargarPrestamos(); // Recargar lista
      })
    );
  }

  obtenerPrestamos(fondoId?: string): Observable<Prestamo[]> {
    let url = this.apiUrl;
    if (fondoId) {
      url += `?fondoId=${fondoId}`;
    }
    
    return this.http.get<Prestamo[]>(url).pipe(
      tap(prestamos => {
        console.log(`📋 [PRESTAMO-SERVICE] Préstamos obtenidos:`, prestamos.length);
        this.prestamosSubject.next(prestamos);
      })
    );
  }

  obtenerPrestamo(id: string): Observable<Prestamo> {
    return this.http.get<Prestamo>(`${this.apiUrl}/${id}`);
  }

  actualizarPrestamo(id: string, updatePrestamoDto: UpdatePrestamoDto): Observable<Prestamo> {
    console.log('🔄 [PRESTAMO-SERVICE] Actualizando préstamo:', id, updatePrestamoDto);
    
    return this.http.patch<Prestamo>(`${this.apiUrl}/${id}`, updatePrestamoDto).pipe(
      tap(prestamo => {
        console.log('✅ [PRESTAMO-SERVICE] Préstamo actualizado:', prestamo);
        this.cargarPrestamos(); // Recargar lista
      })
    );
  }

  eliminarPrestamo(id: string): Observable<void> {
    console.log('🗑️ [PRESTAMO-SERVICE] Eliminando préstamo:', id);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log('✅ [PRESTAMO-SERVICE] Préstamo eliminado');
        this.cargarPrestamos(); // Recargar lista
      })
    );
  }

  // ===== GESTIÓN DE PAGOS =====

  registrarPago(prestamoId: string, createPagoDto: CreatePagoPrestamoDto): Observable<PagoPrestamo> {
    console.log('💳 [PRESTAMO-SERVICE] Registrando pago:', prestamoId, createPagoDto);
    
    return this.http.post<PagoPrestamo>(`${this.apiUrl}/${prestamoId}/pagos`, createPagoDto).pipe(
      tap(pago => {
        console.log('✅ [PRESTAMO-SERVICE] Pago registrado:', pago);
        this.cargarPrestamos(); // Recargar lista para actualizar saldos
      })
    );
  }

  obtenerPagosPrestamo(prestamoId: string): Observable<PagoPrestamo[]> {
    return this.http.get<PagoPrestamo[]>(`${this.apiUrl}/${prestamoId}/pagos`);
  }

  // ===== ESTADÍSTICAS Y REPORTES =====

  obtenerEstadisticas(fondoId?: string): Observable<EstadisticasPrestamos> {
    let url = `${this.apiUrl}/estadisticas`;
    if (fondoId) {
      url += `?fondoId=${fondoId}`;
    }
    
    return this.http.get<EstadisticasPrestamos>(url);
  }

  obtenerResumenDeudores(fondoId?: string): Observable<ResumenDeudor[]> {
    let url = `${this.apiUrl}/resumen-deudores`;
    if (fondoId) {
      url += `?fondoId=${fondoId}`;
    }
    
    return this.http.get<ResumenDeudor[]>(url);
  }

  actualizarEstadosVencidos(): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar-vencidos`, {});
  }

  // ===== MÉTODOS AUXILIARES =====

  private cargarPrestamos(): void {
    this.obtenerPrestamos().subscribe();
  }

  // Método para obtener el estado actual de los préstamos sin realizar nueva petición
  obtenerPrestamosActuales(): Prestamo[] {
    return this.prestamosSubject.value;
  }

  // Filtros y utilidades
  filtrarPorEstado(prestamos: Prestamo[], estado: string): Prestamo[] {
    return prestamos.filter(p => p.estado === estado);
  }

  filtrarPorDeudor(prestamos: Prestamo[], nombreDeudor: string): Prestamo[] {
    return prestamos.filter(p => 
      p.nombreDeudor.toLowerCase().includes(nombreDeudor.toLowerCase())
    );
  }

  calcularSaldoPendiente(prestamo: Prestamo): number {
    return prestamo.montoOriginal - prestamo.montoAbonado;
  }

  calcularPorcentajePagado(prestamo: Prestamo): number {
    return (prestamo.montoAbonado / prestamo.montoOriginal) * 100;
  }

  obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'activo': 'estado-activo',
      'pagado': 'estado-pagado',
      'vencido': 'estado-vencido',
      'parcial': 'estado-parcial'
    };
    return clases[estado] || '';
  }

  obtenerIconoEstado(estado: string): string {
    const iconos: { [key: string]: string } = {
      'activo': 'schedule',
      'pagado': 'check_circle',
      'vencido': 'warning',
      'parcial': 'hourglass_half'
    };
    return iconos[estado] || 'help';
  }

  esVencido(prestamo: Prestamo): boolean {
    if (!prestamo.fechaVencimiento) return false;
    
    const ahora = new Date();
    const vencimiento = new Date(prestamo.fechaVencimiento);
    
    return vencimiento < ahora && prestamo.estado !== 'pagado';
  }

  diasHastaVencimiento(prestamo: Prestamo): number | null {
    if (!prestamo.fechaVencimiento) return null;
    
    const ahora = new Date();
    const vencimiento = new Date(prestamo.fechaVencimiento);
    const diferencia = vencimiento.getTime() - ahora.getTime();
    
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }
}
