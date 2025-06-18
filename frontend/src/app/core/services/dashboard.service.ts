import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    let params = new HttpParams();
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    
    return this.http.get<ResumenFinanciero>(`${this.apiUrl}/reportes/resumen`, { params })
      .pipe(
        catchError(error => {
          console.error('Error al obtener resumen financiero:', error);
          // Datos simulados para desarrollo
          const resumenSimulado: ResumenFinanciero = {
            totalIngresos: 2500000,
            totalGastos: 1800000,
            balance: 700000,
            fondosPorTipo: [
              { tipo: 'ahorro', cantidad: 2, montoTotal: 1200000, progreso: 75 },
              { tipo: 'emergencia', cantidad: 1, montoTotal: 800000, progreso: 90 },
              { tipo: 'personal', cantidad: 1, montoTotal: 500000, progreso: 50 }
            ],
            transaccionesPorCategoria: [
              { categoria: 'alimentacion', tipo: 'gasto', monto: 600000, cantidad: 12, porcentaje: 33.3 },
              { categoria: 'transporte', tipo: 'gasto', monto: 400000, cantidad: 8, porcentaje: 22.2 },
              { categoria: 'salario', tipo: 'ingreso', monto: 2500000, cantidad: 1, porcentaje: 100 }
            ],
            tendenciaMensual: [
              { mes: 'Enero', ingresos: 2200000, gastos: 1600000, balance: 600000 },
              { mes: 'Febrero', ingresos: 2300000, gastos: 1700000, balance: 600000 },
              { mes: 'Marzo', ingresos: 2500000, gastos: 1800000, balance: 700000 }
            ]
          };
          return [resumenSimulado];
        })
      );
  }

  obtenerEstadisticas(): Observable<EstadisticasDashboard> {
    return this.http.get<EstadisticasDashboard>(`${this.apiUrl}/fondos/estadisticas`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener estadísticas:', error);
          // Datos simulados para desarrollo
          const estadisticasSimuladas: EstadisticasDashboard = {
            totalFondos: 5,
            fondosActivos: 3,
            transaccionesHoy: 2,
            transaccionesMes: 24,
            mayorGasto: 150000,
            mayorIngreso: 2500000
          };
          return [estadisticasSimuladas];
        })
      );
  }

  obtenerDatosGrafico(
    tipo: 'ingresos-gastos' | 'categorias' | 'fondos' | 'tendencia',
    periodo: 'semana' | 'mes' | 'trimestre' | 'año' = 'mes'
  ): Observable<any> {
    const params = new HttpParams().set('periodo', periodo);
    
    return this.http.get(`${this.apiUrl}/reportes/grafico/${tipo}`, { params })
      .pipe(
        catchError(error => {
          console.error('Error al obtener datos de gráfico:', error);
          // Retornar datos simulados según el tipo
          let datosSimulados: any;
          
          switch (tipo) {
            case 'ingresos-gastos':
              datosSimulados = {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                  data: [2500000, 1800000],
                  backgroundColor: ['#4caf50', '#f44336']
                }]
              };
              break;
            case 'categorias':
              datosSimulados = {
                labels: ['Alimentación', 'Transporte', 'Entretenimiento', 'Servicios'],
                datasets: [{
                  data: [600000, 400000, 300000, 250000],
                  backgroundColor: ['#2196f3', '#ff9800', '#9c27b0', '#607d8b']
                }]
              };
              break;
            case 'tendencia':
              datosSimulados = {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
                datasets: [
                  {
                    label: 'Ingresos',
                    data: [2200000, 2300000, 2500000, 2400000, 2600000],
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)'
                  },
                  {
                    label: 'Gastos',
                    data: [1600000, 1700000, 1800000, 1750000, 1900000],
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                ]
              };
              break;
            default:
              datosSimulados = { labels: [], datasets: [] };
          }
          
          return [datosSimulados];
        })
      );
  }
}
