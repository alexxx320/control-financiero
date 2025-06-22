import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ResumenFinanciero, EstadisticasDashboard } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  obtenerResumenFinanciero(
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<ResumenFinanciero> {
    console.log('🔍 Dashboard Service - Obteniendo resumen financiero...');
    
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    
    return this.http.get<ResumenFinanciero>(`${this.apiUrl}/dashboard/resumen-financiero`, { params })
      .pipe(
        map(resumen => {
          console.log('✅ Resumen financiero del backend (filtrado por usuario):', resumen);
          return resumen;
        }),
        catchError(error => {
          console.error('❌ Error al obtener resumen financiero:', error);
          console.log('🔄 Fallback a datos vacíos');
          
          const resumenVacio: ResumenFinanciero = {
            totalIngresos: 0,
            totalGastos: 0,
            balance: 0,
            fondosPorTipo: [],
            transaccionesPorCategoria: [],
            tendenciaMensual: []
          };
          return of(resumenVacio);
        })
      );
  }

  obtenerDatosGraficoTendencia(
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<any> {
    console.log('📈 Dashboard Service - Obteniendo datos del gráfico de tendencias...');
    
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    
    return this.http.get<any>(`${this.apiUrl}/dashboard/datos-grafico`, { params })
      .pipe(
        map(datos => {
          console.log('✅ Datos del gráfico del backend:', datos);
          return datos;
        }),
        catchError(error => {
          console.error('❌ Error al obtener datos del gráfico:', error);
          console.log('🔄 Fallback a datos vacíos');
          
          return of({
            labels: [],
            ingresos: [],
            gastos: [],
            periodo: 'mes'
          });
        })
      );
  }

  obtenerEstadisticas(
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<EstadisticasDashboard> {
    console.log('📊 Dashboard Service - Obteniendo estadísticas...');
    
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    
    return this.http.get<EstadisticasDashboard>(`${this.apiUrl}/dashboard/estadisticas`, { params })
      .pipe(
        map(estadisticas => {
          console.log('✅ Estadísticas del backend (filtradas por usuario):', estadisticas);
          return estadisticas;
        }),
        catchError(error => {
          console.error('❌ Error al obtener estadísticas:', error);
          console.log('🔄 Fallback a estadísticas vacías');
          
          const estadisticasVacias: EstadisticasDashboard = {
            totalFondos: 0,
            fondosActivos: 0,
            transaccionesHoy: 0,
            transaccionesMes: 0,
            mayorGasto: 0,
            mayorIngreso: 0
          };
          return of(estadisticasVacias);
        })
      );
  }

  obtenerDatosGrafico(
    tipo: 'ingresos-gastos' | 'categorias' | 'fondos' | 'tendencia',
    periodo: 'semana' | 'mes' | 'trimestre' | 'año' = 'mes'
  ): Observable<any> {
    console.log(`📈 Dashboard Service - Obteniendo datos de gráfico: ${tipo}`);
    
    // Para simplificar, usar el resumen financiero como base
    return this.obtenerResumenFinanciero().pipe(
      map(resumen => this.procesarDatosGrafico(tipo, resumen)),
      catchError(error => {
        console.error(`❌ Error al obtener datos de gráfico ${tipo}:`, error);
        return of(this.getDatosGraficoFallback(tipo));
      })
    );
  }

  // Métodos auxiliares para procesar datos
  private procesarDatosGrafico(tipo: string, resumen: ResumenFinanciero): any {
    switch (tipo) {
      case 'ingresos-gastos':
        return {
          labels: ['Ingresos', 'Gastos'],
          datasets: [{
            data: [resumen.totalIngresos, resumen.totalGastos],
            backgroundColor: ['#4caf50', '#f44336']
          }]
        };
      
      case 'fondos':
        return {
          labels: resumen.fondosPorTipo.map(f => f.tipo),
          datasets: [{
            data: resumen.fondosPorTipo.map(f => f.montoTotal),
            backgroundColor: ['#2196f3', '#ff9800', '#9c27b0', '#4caf50']
          }]
        };
      
      default:
        return { labels: [], datasets: [] };
    }
  }

  private getDatosGraficoFallback(tipo: string): any {
    const fallbacks: { [key: string]: any } = {
      'ingresos-gastos': {
        labels: ['Sin datos'],
        datasets: [{ data: [0], backgroundColor: ['#ccc'] }]
      },
      'tendencia': {
        labels: [],
        datasets: []
      },
      'categorias': {
        labels: [],
        datasets: []
      }
    };
    
    return fallbacks[tipo] || { labels: [], datasets: [] };
  }

  // Método para verificar conectividad del backend
  verificarConectividad(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/dashboard/conectividad`).pipe(
      map(() => {
        console.log('✅ Backend conectado correctamente');
        return true;
      }),
      catchError(error => {
        console.error('❌ Backend no disponible:', error);
        return of(false);
      })
    );
  }
}
