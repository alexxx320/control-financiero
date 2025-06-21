import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ReporteMensual {
  periodo: string;
  mes: number;
  año: number;
  fondos: ReporteFondo[];
  resumen: ResumenPeriodo;
}

export interface ReporteFondo {
  nombre: string;
  balanceInicial: number;
  ingresos: number;
  gastos: number;
  balanceNeto: number;
  balanceFinal: number;
  transacciones: number;
}

export interface ResumenPeriodo {
  totalIngresos: number;
  totalGastos: number;
  balanceNeto: number;
  transaccionesTotales: number;
}

export interface ReporteAnual {
  año: number;
  meses: MesReporte[];
  resumenAnual: ResumenAnual;
}

export interface MesReporte {
  mes: number;
  nombreMes: string;
  ingresos: number;
  gastos: number;
  balance: number;
  transacciones: number;
}

export interface ResumenAnual {
  totalIngresos: number;
  totalGastos: number;
  balanceNeto: number;
  mejorMes: { nombre: string; balance: number } | null;
  peorMes: { nombre: string; balance: number } | null;
}

export interface Alerta {
  tipo: 'ERROR' | 'ADVERTENCIA' | 'INFO' | 'EXITO';
  fondo: string;
  mensaje: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface EstadisticasGenerales {
  totalFondos: number;
  totalTransacciones: number;
  balanceTotal: number;
  fondoMayorBalance: string;
  categoriaFrecuente: string;
  promedioGastoMensual: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener dashboard completo con todos los datos
   */
  obtenerDashboard(periodo: string = 'mes'): Observable<any> {
    console.log(`📊 Obteniendo dashboard completo para período: ${periodo}`);
    
    const params = new HttpParams().set('periodo', periodo);

    return this.http.get<any>(`${this.apiUrl}/dashboard`, { params })
      .pipe(
        map(dashboard => {
          console.log('✅ Dashboard obtenido exitosamente:', dashboard);
          return dashboard;
        }),
        catchError(error => {
          console.error('❌ Error al obtener dashboard:', error);
          
          // Retornar estructura vacía para evitar errores en el frontend
          const dashboardVacio = {
            kpis: {
              totalIngresos: 0,
              totalGastos: 0,
              utilidadNeta: 0,
              margenUtilidad: 0,
              fondosActivos: 0,
              transaccionesPromedio: 0
            },
            alertas: [],
            fondosPerformance: [],
            reporteMensual: null,
            reporteAnual: null,
            estadisticas: null,
            periodo: periodo
          };
          
          return of(dashboardVacio);
        })
      );
  }

  /**
   * Generar reporte mensual
   */
  generarReporteMensual(mes: number, año: number): Observable<ReporteMensual> {
    console.log(`📊 Generando reporte mensual: ${mes}/${año}`);
    
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('año', año.toString());

    return this.http.get<ReporteMensual>(`${this.apiUrl}/mensual`, { params })
      .pipe(
        map(reporte => {
          console.log('✅ Reporte mensual obtenido:', reporte);
          return reporte;
        }),
        catchError(error => {
          console.error('❌ Error al generar reporte mensual:', error);
          
          // Fallback con datos vacíos
          const reporteVacio: ReporteMensual = {
            periodo: `${this.getNombreMes(mes)} ${año}`,
            mes,
            año,
            fondos: [],
            resumen: {
              totalIngresos: 0,
              totalGastos: 0,
              balanceNeto: 0,
              transaccionesTotales: 0
            }
          };
          return of(reporteVacio);
        })
      );
  }

  /**
   * Generar reporte anual
   */
  generarReporteAnual(año: number): Observable<ReporteAnual> {
    console.log(`📅 Generando reporte anual: ${año}`);
    
    const params = new HttpParams().set('año', año.toString());

    return this.http.get<ReporteAnual>(`${this.apiUrl}/anual`, { params })
      .pipe(
        map(reporte => {
          console.log('✅ Reporte anual obtenido:', reporte);
          return reporte;
        }),
        catchError(error => {
          console.error('❌ Error al generar reporte anual:', error);
          
          // Fallback con datos vacíos
          const reporteVacio: ReporteAnual = {
            año,
            meses: [],
            resumenAnual: {
              totalIngresos: 0,
              totalGastos: 0,
              balanceNeto: 0,
              mejorMes: null,
              peorMes: null
            }
          };
          return of(reporteVacio);
        })
      );
  }

  /**
   * Obtener alertas financieras
   */
  obtenerAlertas(): Observable<Alerta[]> {
    console.log('🚨 Obteniendo alertas financieras...');
    
    return this.http.get<Alerta[]>(`${this.apiUrl}/alertas`)
      .pipe(
        map(alertas => {
          console.log('✅ Alertas obtenidas:', alertas);
          return alertas;
        }),
        catchError(error => {
          console.error('❌ Error al obtener alertas:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtener estadísticas generales
   */
  obtenerEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    console.log('📈 Obteniendo estadísticas generales...');
    
    return this.http.get<EstadisticasGenerales>(`${this.apiUrl}/estadisticas`)
      .pipe(
        map(estadisticas => {
          console.log('✅ Estadísticas obtenidas:', estadisticas);
          return estadisticas;
        }),
        catchError(error => {
          console.error('❌ Error al obtener estadísticas:', error);
          
          // Fallback con datos vacíos
          const estadisticasVacias: EstadisticasGenerales = {
            totalFondos: 0,
            totalTransacciones: 0,
            balanceTotal: 0,
            fondoMayorBalance: 'N/A',
            categoriaFrecuente: 'N/A',
            promedioGastoMensual: 0
          };
          return of(estadisticasVacias);
        })
      );
  }

  /**
   * Obtener datos para gráficos
   */
  obtenerDatosGraficos(periodo: string = 'mes', tipo: string = 'tendencia'): Observable<any> {
    console.log(`📈 Obteniendo datos de gráficos: ${tipo} - ${periodo}`);
    
    const params = new HttpParams()
      .set('periodo', periodo)
      .set('tipo', tipo);

    return this.http.get<any>(`${this.apiUrl}/graficos`, { params })
      .pipe(
        map(datos => {
          console.log('✅ Datos de gráficos obtenidos:', datos);
          return datos;
        }),
        catchError(error => {
          console.error('❌ Error al obtener datos de gráficos:', error);
          return of({ message: 'Error al cargar datos de gráficos' });
        })
      );
  }

  /**
   * Exportar reporte a PDF
   */
  exportarPDF(data: any): Observable<Blob> {
    console.log('📄 Exportando reporte a PDF...');
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/exportar/pdf`, data, {
      headers,
      responseType: 'blob'
    }).pipe(
      map(blob => {
        console.log('✅ PDF generado exitosamente');
        return blob;
      }),
      catchError(error => {
        console.error('❌ Error al exportar PDF:', error);
        throw error;
      })
    );
  }

  /**
   * Exportar reporte a Excel
   */
  exportarExcel(data: any): Observable<Blob> {
    console.log('📊 Exportando reporte a Excel...');
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/exportar/excel`, data, {
      headers,
      responseType: 'blob'
    }).pipe(
      map(blob => {
        console.log('✅ Excel generado exitosamente');
        return blob;
      }),
      catchError(error => {
        console.error('❌ Error al exportar Excel:', error);
        throw error;
      })
    );
  }

  /**
   * Generar reporte por período personalizado
   */
  generarReportePorPeriodo(fechaInicio: string, fechaFin: string): Observable<any> {
    console.log(`📅 Generando reporte por período: ${fechaInicio} - ${fechaFin}`);
    
    // Por ahora usar el reporte mensual como base
    const fecha = new Date(fechaInicio);
    return this.generarReporteMensual(fecha.getMonth() + 1, fecha.getFullYear());
  }

  /**
   * Generar reporte rápido según período seleccionado
   */
  generarReporteRapido(periodo: 'semana' | 'mes' | 'trimestre' | 'año'): Observable<ReporteMensual | ReporteAnual> {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const añoActual = fechaActual.getFullYear();

    console.log(`⚡ Generando reporte rápido para período: ${periodo}`);

    switch (periodo) {
      case 'mes':
        return this.generarReporteMensual(mesActual, añoActual);
      case 'año':
        return this.generarReporteAnual(añoActual);
      case 'trimestre':
        // Por ahora usar el mes actual
        return this.generarReporteMensual(mesActual, añoActual);
      case 'semana':
        // Por ahora usar el mes actual
        return this.generarReporteMensual(mesActual, añoActual);
      default:
        return this.generarReporteMensual(mesActual, añoActual);
    }
  }

  /**
   * Test de conectividad del servicio
   */
  testConectividad(): Observable<any> {
    console.log('🔧 Probando conectividad del servicio de reportes...');
    
    return this.http.get<any>(`${this.apiUrl}/test`)
      .pipe(
        map(response => {
          console.log('✅ Servicio de reportes funcionando:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Error de conectividad:', error);
          return of({ error: 'No se pudo conectar con el servicio de reportes' });
        })
      );
  }

  /**
   * Obtener nombre del mes en español
   */
  private getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || 'Mes Inválido';
  }

  /**
   * Formatear moneda en pesos colombianos
   */
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }

  /**
   * Obtener color para alertas según tipo
   */
  getColorAlerta(tipo: string): string {
    switch (tipo) {
      case 'ERROR': return '#f44336';
      case 'ADVERTENCIA': return '#ff9800';
      case 'INFO': return '#2196f3';
      case 'EXITO': return '#4caf50';
      default: return '#757575';
    }
  }

  /**
   * Obtener icono para alertas según tipo
   */
  getIconoAlerta(tipo: string): string {
    switch (tipo) {
      case 'ERROR': return 'error';
      case 'ADVERTENCIA': return 'warning';
      case 'INFO': return 'info';
      case 'EXITO': return 'check_circle';
      default: return 'help';
    }
  }
}
