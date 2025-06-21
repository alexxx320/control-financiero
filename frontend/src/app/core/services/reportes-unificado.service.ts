import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaces para tipado fuerte
export interface DashboardData {
  periodo: {
    tipo: string;
    fechaInicio: string;
    fechaFin: string;
    descripcion: string;
  };
  kpis: KPIs;
  graficos: {
    tendenciaMensual: TendenciaMensual[];
    distribucionCategorias: DistribucionCategoria[];
    fondosPerformance: PerformanceFondo[];
    flujoCaja: FlujoCaja[];
  };
  resumen: ResumenReporte;
  fondos: FondoReporte[];
  alertas: Alerta[];
  estadisticas: EstadisticasGenerales;
  metadata: {
    fechaGeneracion: string;
    totalRegistros: number;
    hayDatos: boolean;
  };
}

export interface KPIs {
  totalIngresos: number;
  totalGastos: number;
  utilidadNeta: number;
  margenUtilidad: number;
  fondosActivos: number;
  transaccionesPromedio: number;
  crecimientoMensual: number;
  liquidezTotal: number;
}

export interface TendenciaMensual {
  mes: string;
  año: number;
  ingresos: number;
  gastos: number;
  utilidad: number;
  transacciones: number;
}

export interface DistribucionCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
  transacciones: number;
}

export interface PerformanceFondo {
  id: string;
  nombre: string;
  tipo: string;
  balanceActual: number;
  objetivo?: number;
  progresoMeta: number;
  rendimiento: 'excelente' | 'bueno' | 'regular' | 'malo';
  crecimiento: number;
}

export interface FlujoCaja {
  fecha: string;
  entradas: number;
  salidas: number;
  neto: number;
}

export interface FondoReporte {
  id: string;
  nombre: string;
  tipo: string;
  balanceInicial: number;
  ingresos: number;
  gastos: number;
  balanceNeto: number;
  balanceFinal: number;
  transacciones: number;
  ultimaTransaccion?: Date;
}

export interface ResumenReporte {
  totalIngresos: number;
  totalGastos: number;
  balanceNeto: number;
  transaccionesTotales: number;
  fondosActivos: number;
  promedioIngresoPorFondo: number;
  promedioGastoPorFondo: number;
}

export interface Alerta {
  tipo: 'ERROR' | 'ADVERTENCIA' | 'INFO' | 'EXITO';
  fondo: string;
  mensaje: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  fecha: Date;
}

export interface EstadisticasGenerales {
  totalFondos: number;
  totalTransacciones: number;
  balanceTotal: number;
  fondoMayorBalance: string;
  categoriaFrecuente: string;
  promedioGastoMensual: number;
  diasDesdeUltimaTransaccion: number;
}

export interface AlertasResponse {
  alertas: Alerta[];
  total: number;
  porPrioridad: {
    alta: number;
    media: number;
    baja: number;
  };
}

export interface FiltrosExportacion {
  periodo: 'semana' | 'mes' | 'trimestre' | 'año';
  fechaInicio?: string;
  fechaFin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesUnificadoService {
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener dashboard principal unificado
   */
  obtenerDashboard(periodo: string = 'mes'): Observable<DashboardData> {
    console.log(`🌐 Obteniendo dashboard unificado - Período: ${periodo}`);
    
    const params = new HttpParams().set('periodo', periodo);
    
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`, { params })
      .pipe(
        map(response => {
          console.log('✅ Dashboard obtenido exitosamente:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Error al obtener dashboard:', error);
          return throwError(() => new Error('Error al cargar el dashboard'));
        })
      );
  }

  /**
   * Obtener datos específicos para gráficos
   */
  obtenerDatosGraficos(tipo: string = 'tendencia', periodo: string = 'mes'): Observable<any> {
    console.log(`📈 Obteniendo datos de gráfico: ${tipo} - Período: ${periodo}`);
    
    const params = new HttpParams()
      .set('tipo', tipo)
      .set('periodo', periodo);
    
    return this.http.get(`${this.apiUrl}/graficos`, { params })
      .pipe(
        map(response => {
          console.log(`✅ Datos de gráfico ${tipo} obtenidos:`, response);
          return response;
        }),
        catchError(error => {
          console.error(`❌ Error al obtener datos del gráfico ${tipo}:`, error);
          return throwError(() => new Error(`Error al cargar datos del gráfico ${tipo}`));
        })
      );
  }

  /**
   * Obtener reporte específico por mes/año
   */
  obtenerReporteEspecifico(mes?: number, año?: number): Observable<any> {
    console.log(`📋 Obteniendo reporte específico - Mes: ${mes}, Año: ${año}`);
    
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes.toString());
    if (año) params = params.set('año', año.toString());
    
    return this.http.get(`${this.apiUrl}/reporte/mensual`, { params })
      .pipe(
        map(response => {
          console.log('✅ Reporte específico obtenido:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Error al obtener reporte específico:', error);
          return throwError(() => new Error('Error al cargar el reporte'));
        })
      );
  }

  /**
   * Obtener alertas financieras
   */
  obtenerAlertas(): Observable<AlertasResponse> {
    console.log('🚨 Obteniendo alertas financieras...');
    
    return this.http.get<AlertasResponse>(`${this.apiUrl}/alertas`)
      .pipe(
        map(response => {
          console.log('✅ Alertas obtenidas:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Error al obtener alertas:', error);
          return throwError(() => new Error('Error al cargar las alertas'));
        })
      );
  }

  /**
   * Exportar reporte a PDF
   */
  exportarPDF(filtros: FiltrosExportacion): Observable<void> {
    console.log('📄 Exportando reporte a PDF:', filtros);
    
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/exportar/pdf`, filtros, {
        responseType: 'blob',
        observe: 'response'
      }).subscribe({
        next: (response) => {
          try {
            // Crear URL para descarga
            const blob = response.body;
            if (!blob) {
              throw new Error('No se recibió el archivo PDF');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Obtener nombre del archivo desde los headers o generar uno
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'reporte-financiero.pdf';
            
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="(.+)"/);
              if (filenameMatch) {
                filename = filenameMatch[1];
              }
            } else {
              // Generar nombre basado en fecha actual
              const fecha = new Date().toISOString().split('T')[0];
              filename = `reporte-financiero-${fecha}.pdf`;
            }
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Agregar al DOM, hacer clic y remover
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpiar URL
            window.URL.revokeObjectURL(url);
            
            console.log('✅ PDF descargado exitosamente:', filename);
            observer.next();
            observer.complete();
            
          } catch (error) {
            console.error('❌ Error al procesar descarga de PDF:', error);
            observer.error(error);
          }
        },
        error: (error) => {
          console.error('❌ Error al exportar PDF:', error);
          observer.error(new Error('Error al generar el reporte PDF'));
        }
      });
    });
  }

  /**
   * Exportar reporte a Excel
   */
  exportarExcel(filtros: FiltrosExportacion): Observable<void> {
    console.log('📊 Exportando reporte a Excel:', filtros);
    
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/exportar/excel`, filtros, {
        responseType: 'blob',
        observe: 'response'
      }).subscribe({
        next: (response) => {
          try {
            // Crear URL para descarga
            const blob = response.body;
            if (!blob) {
              throw new Error('No se recibió el archivo Excel');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Obtener nombre del archivo desde los headers o generar uno
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'reporte-financiero.xlsx';
            
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="(.+)"/);
              if (filenameMatch) {
                filename = filenameMatch[1];
              }
            } else {
              // Generar nombre basado en fecha actual
              const fecha = new Date().toISOString().split('T')[0];
              filename = `reporte-financiero-${fecha}.xlsx`;
            }
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Agregar al DOM, hacer clic y remover
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpiar URL
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Excel descargado exitosamente:', filename);
            observer.next();
            observer.complete();
            
          } catch (error) {
            console.error('❌ Error al procesar descarga de Excel:', error);
            observer.error(error);
          }
        },
        error: (error) => {
          console.error('❌ Error al exportar Excel:', error);
          observer.error(new Error('Error al generar el reporte Excel'));
        }
      });
    });
  }

  /**
   * Verificar estado del servicio
   */
  verificarEstado(): Observable<any> {
    console.log('🔍 Verificando estado del servicio de reportes...');
    
    return this.http.get(`${this.apiUrl}/test`)
      .pipe(
        map(response => {
          console.log('✅ Estado del servicio verificado:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Error al verificar estado del servicio:', error);
          return throwError(() => new Error('Error de conectividad con el servicio'));
        })
      );
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
   * Formatear porcentaje
   */
  formatearPorcentaje(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(valor / 100);
  }

  /**
   * Formatear número con separadores de miles
   */
  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-CO').format(valor);
  }

  /**
   * Obtener color según el tipo de alerta
   */
  obtenerColorAlerta(tipo: string): string {
    const colores = {
      'ERROR': '#e74c3c',
      'ADVERTENCIA': '#f39c12',
      'INFO': '#3498db',
      'EXITO': '#27ae60'
    };
    return colores[tipo as keyof typeof colores] || '#95a5a6';
  }

  /**
   * Obtener icono según el tipo de alerta
   */
  obtenerIconoAlerta(tipo: string): string {
    const iconos = {
      'ERROR': 'error',
      'ADVERTENCIA': 'warning',
      'INFO': 'info',
      'EXITO': 'check_circle'
    };
    return iconos[tipo as keyof typeof iconos] || 'help';
  }

  /**
   * Obtener descripción legible del período
   */
  obtenerDescripcionPeriodo(periodo: string): string {
    const descripciones = {
      'semana': 'Esta Semana',
      'mes': 'Este Mes',
      'trimestre': 'Este Trimestre',
      'año': 'Este Año'
    };
    return descripciones[periodo as keyof typeof descripciones] || 'Período Personalizado';
  }

  /**
   * Validar si hay datos suficientes para mostrar gráficos
   */
  validarDatosParaGraficos(datos: any): boolean {
    if (!datos || !datos.graficos) return false;
    
    const { tendenciaMensual, distribucionCategorias, fondosPerformance, flujoCaja } = datos.graficos;
    
    return (tendenciaMensual && tendenciaMensual.length > 0) ||
           (distribucionCategorias && distribucionCategorias.length > 0) ||
           (fondosPerformance && fondosPerformance.length > 0) ||
           (flujoCaja && flujoCaja.length > 0);
  }

  /**
   * Calcular totales para resúmenes
   */
  calcularTotales(fondos: FondoReporte[]): ResumenReporte {
    if (!fondos || fondos.length === 0) {
      return {
        totalIngresos: 0,
        totalGastos: 0,
        balanceNeto: 0,
        transaccionesTotales: 0,
        fondosActivos: 0,
        promedioIngresoPorFondo: 0,
        promedioGastoPorFondo: 0
      };
    }

    const totalIngresos = fondos.reduce((sum, f) => sum + (f.ingresos || 0), 0);
    const totalGastos = fondos.reduce((sum, f) => sum + (f.gastos || 0), 0);
    const transaccionesTotales = fondos.reduce((sum, f) => sum + (f.transacciones || 0), 0);

    return {
      totalIngresos,
      totalGastos,
      balanceNeto: totalIngresos - totalGastos,
      transaccionesTotales,
      fondosActivos: fondos.length,
      promedioIngresoPorFondo: fondos.length > 0 ? totalIngresos / fondos.length : 0,
      promedioGastoPorFondo: fondos.length > 0 ? totalGastos / fondos.length : 0
    };
  }
}
