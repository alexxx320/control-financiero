import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrestamoServiceBasico {
  
  obtenerEstadisticas(fondoId: string): Observable<any> {
    // Implementación básica que devuelve datos mock
    return of({
      totalPrestamos: 0,
      prestamosActivos: 0,
      prestamosPagados: 0,
      prestamosVencidos: 0,
      montoTotalPrestado: 0,
      montoTotalRecuperado: 0,
      saldoPendienteTotal: 0,
      porcentajeRecuperacion: 0
    });
  }

  // Otros métodos básicos se pueden añadir aquí según sea necesario
}
