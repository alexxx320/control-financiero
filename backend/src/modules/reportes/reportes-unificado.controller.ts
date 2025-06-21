import { 
  Controller, 
  Get, 
  Post, 
  Query, 
  Body, 
  UseGuards, 
  Req, 
  Res, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { Response } from 'express';
import { ReportesUnificadoService } from './reportes-unificado.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface FiltrosReporte {
  periodo: 'semana' | 'mes' | 'trimestre' | 'año';
  fechaInicio?: string;
  fechaFin?: string;
}

@Controller('api/reportes')
@UseGuards(JwtAuthGuard)
export class ReportesUnificadoController {
  constructor(
    private readonly reportesService: ReportesUnificadoService
  ) {}

  /**
   * Dashboard principal con datos reales unificados
   */
  @Get('dashboard')
  async obtenerDashboard(
    @Query('periodo') periodo: string = 'mes',
    @Req() req: any
  ): Promise<any> {
    console.log(`📊 Obteniendo dashboard unificado - Usuario: ${req.user.id}, Período: ${periodo}`);
    
    try {
      const usuarioId = req.user.id;
      const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);
      
      // Obtener todos los datos necesarios para el dashboard
      const [
        reporteBase,
        kpis,
        tendenciaMensual,
        distribucionCategorias,
        fondosPerformance,
        flujoCaja,
        alertas,
        estadisticas
      ] = await Promise.all([
        this.reportesService.generarReporteBase(usuarioId, fechaInicio, fechaFin),
        this.reportesService.calcularKPIs(usuarioId, fechaInicio, fechaFin),
        this.reportesService.obtenerTendenciaMensual(usuarioId, 6), // Últimos 6 meses
        this.reportesService.obtenerDistribucionCategorias(usuarioId, fechaInicio, fechaFin),
        this.reportesService.obtenerPerformanceFondos(usuarioId, fechaInicio, fechaFin),
        this.reportesService.obtenerFlujoCaja(usuarioId, fechaInicio, fechaFin),
        this.reportesService.obtenerAlertasFinancieras(usuarioId),
        this.reportesService.obtenerEstadisticasGenerales(usuarioId)
      ]);

      const dashboardData = {
        // Información del período
        periodo: {
          tipo: periodo,
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFin: fechaFin.toISOString().split('T')[0],
          descripcion: this.getDescripcionPeriodo(periodo, fechaInicio, fechaFin)
        },
        
        // KPIs principales
        kpis,
        
        // Datos para gráficos
        graficos: {
          tendenciaMensual,
          distribucionCategorias: distribucionCategorias.slice(0, 8), // Top 8
          fondosPerformance: fondosPerformance.slice(0, 5), // Top 5
          flujoCaja: flujoCaja.slice(-30) // Últimos 30 días
        },
        
        // Resumen del reporte base
        resumen: reporteBase.resumen,
        fondos: reporteBase.fondos,
        
        // Alertas activas (máximo 10)
        alertas: alertas.slice(0, 10),
        
        // Estadísticas generales
        estadisticas,
        
        // Metadatos
        metadata: {
          fechaGeneracion: new Date().toISOString(),
          totalRegistros: reporteBase.fondos.length,
          hayDatos: reporteBase.fondos.length > 0
        }
      };

      console.log('✅ Dashboard unificado generado exitosamente');
      return dashboardData;

    } catch (error) {
      console.error('❌ Error al generar dashboard unificado:', error);
      throw error;
    }
  }

  /**
   * Datos específicos para gráficos
   */
  @Get('graficos')
  async obtenerDatosGraficos(
    @Query('tipo') tipo: string = 'tendencia',
    @Query('periodo') periodo: string = 'mes',
    @Req() req: any
  ): Promise<any> {
    console.log(`📈 Obteniendo datos de gráfico: ${tipo} - Período: ${periodo}`);
    
    try {
      const usuarioId = req.user.id;
      const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);

      switch (tipo) {
        case 'tendencia':
          const tendencia = await this.reportesService.obtenerTendenciaMensual(usuarioId, 6);
          return {
            type: 'line',
            data: {
              labels: tendencia.map(item => item.mes),
              datasets: [
                {
                  label: 'Ingresos',
                  data: tendencia.map(item => item.ingresos),
                  borderColor: '#4CAF50',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Gastos',
                  data: tendencia.map(item => item.gastos),
                  borderColor: '#F44336',
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Utilidad',
                  data: tendencia.map(item => item.utilidad),
                  borderColor: '#2196F3',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  tension: 0.4,
                  fill: false
                }
              ]
            }
          };

        case 'categorias':
          const categorias = await this.reportesService.obtenerDistribucionCategorias(usuarioId, fechaInicio, fechaFin);
          return {
            type: 'pie',
            data: {
              labels: categorias.map(item => item.categoria),
              datasets: [{
                data: categorias.map(item => item.monto),
                backgroundColor: [
                  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                  '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ]
              }]
            }
          };

        case 'flujo':
          const flujo = await this.reportesService.obtenerFlujoCaja(usuarioId, fechaInicio, fechaFin);
          return {
            type: 'bar',
            data: {
              labels: flujo.map(item => item.fecha),
              datasets: [
                {
                  label: 'Entradas',
                  data: flujo.map(item => item.entradas),
                  backgroundColor: 'rgba(76, 175, 80, 0.8)',
                  borderColor: '#4CAF50',
                  borderWidth: 1
                },
                {
                  label: 'Salidas',
                  data: flujo.map(item => -item.salidas),
                  backgroundColor: 'rgba(244, 67, 54, 0.8)',
                  borderColor: '#F44336',
                  borderWidth: 1
                }
              ]
            }
          };

        case 'fondos':
          const fondos = await this.reportesService.obtenerPerformanceFondos(usuarioId, fechaInicio, fechaFin);
          return {
            type: 'horizontalBar',
            data: {
              labels: fondos.map(item => item.nombre),
              datasets: [{
                label: 'Balance Actual',
                data: fondos.map(item => item.balanceActual),
                backgroundColor: fondos.map(item => 
                  item.rendimiento === 'excelente' ? '#4CAF50' :
                  item.rendimiento === 'bueno' ? '#2196F3' :
                  item.rendimiento === 'regular' ? '#FF9800' : '#F44336'
                )
              }]
            }
          };

        default:
          throw new Error(`Tipo de gráfico no soportado: ${tipo}`);
      }

    } catch (error) {
      console.error(`❌ Error al obtener datos de gráfico ${tipo}:`, error);
      throw error;
    }
  }

  /**
   * Reportes específicos por período
   */
  @Get('reporte/:tipo')
  async obtenerReporte(
    @Query('mes') mes: string,
    @Query('año') año: string,
    @Req() req: any
  ): Promise<any> {
    console.log(`📋 Obteniendo reporte específico - Mes: ${mes}, Año: ${año}`);
    
    try {
      const usuarioId = req.user.id;
      const mesNum = parseInt(mes) || new Date().getMonth() + 1;
      const añoNum = parseInt(año) || new Date().getFullYear();
      
      const fechaInicio = new Date(añoNum, mesNum - 1, 1);
      const fechaFin = new Date(añoNum, mesNum, 0);
      
      return await this.reportesService.generarReporteBase(usuarioId, fechaInicio, fechaFin);

    } catch (error) {
      console.error('❌ Error al obtener reporte específico:', error);
      throw error;
    }
  }

  /**
   * Alertas financieras
   */
  @Get('alertas')
  async obtenerAlertas(@Req() req: any): Promise<any> {
    console.log(`🚨 Obteniendo alertas financieras - Usuario: ${req.user.id}`);
    
    try {
      const usuarioId = req.user.id;
      const alertas = await this.reportesService.obtenerAlertasFinancieras(usuarioId);
      
      return {
        alertas,
        total: alertas.length,
        porPrioridad: {
          alta: alertas.filter(a => a.prioridad === 'ALTA').length,
          media: alertas.filter(a => a.prioridad === 'MEDIA').length,
          baja: alertas.filter(a => a.prioridad === 'BAJA').length
        }
      };

    } catch (error) {
      console.error('❌ Error al obtener alertas:', error);
      throw error;
    }
  }

  /**
   * Exportar a PDF
   */
  @Post('exportar/pdf')
  async exportarPDF(
    @Body() filtros: FiltrosReporte,
    @Req() req: any,
    @Res() res: Response
  ): Promise<void> {
    console.log(`📄 Exportando reporte a PDF - Usuario: ${req.user.id}`);
    
    try {
      const usuarioId = req.user.id;
      const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(filtros.periodo);
      
      // Obtener datos completos para el reporte
      const [reporteBase, kpis, tendencia] = await Promise.all([
        this.reportesService.generarReporteBase(usuarioId, fechaInicio, fechaFin),
        this.reportesService.calcularKPIs(usuarioId, fechaInicio, fechaFin),
        this.reportesService.obtenerTendenciaMensual(usuarioId, 6)
      ]);

      // Generar PDF
      const pdfBuffer = await this.reportesService.generarPDF({
        reporte: reporteBase,
        kpis,
        tendencia,
        periodo: this.getDescripcionPeriodo(filtros.periodo, fechaInicio, fechaFin),
        usuario: req.user
      });

      // Configurar headers para descarga
      const fileName = `reporte-financiero-${fechaInicio.toISOString().split('T')[0]}.pdf`;
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.end(pdfBuffer);

    } catch (error) {
      console.error('❌ Error al exportar PDF:', error);
      res.status(500).json({ 
        error: 'Error al generar el reporte PDF',
        message: error.message 
      });
    }
  }

  /**
   * Exportar a Excel
   */
  @Post('exportar/excel')
  async exportarExcel(
    @Body() filtros: FiltrosReporte,
    @Req() req: any,
    @Res() res: Response
  ): Promise<void> {
    console.log(`📊 Exportando reporte a Excel - Usuario: ${req.user.id}`);
    
    try {
      const usuarioId = req.user.id;
      const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(filtros.periodo);
      
      // Obtener datos completos para el reporte
      const [reporteBase, kpis, tendencia, alertas] = await Promise.all([
        this.reportesService.generarReporteBase(usuarioId, fechaInicio, fechaFin),
        this.reportesService.calcularKPIs(usuarioId, fechaInicio, fechaFin),
        this.reportesService.obtenerTendenciaMensual(usuarioId, 12),
        this.reportesService.obtenerAlertasFinancieras(usuarioId)
      ]);

      // Generar Excel
      const excelBuffer = await this.reportesService.generarExcel({
        reporte: reporteBase,
        kpis,
        tendencia,
        alertas,
        periodo: this.getDescripcionPeriodo(filtros.periodo, fechaInicio, fechaFin),
        usuario: req.user
      });

      // Configurar headers para descarga
      const fileName = `reporte-financiero-${fechaInicio.toISOString().split('T')[0]}.xlsx`;
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': excelBuffer.length,
      });
      
      res.end(excelBuffer);

    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      res.status(500).json({ 
        error: 'Error al generar el reporte Excel',
        message: error.message 
      });
    }
  }

  /**
   * Endpoint de prueba
   */
  @Get('test')
  test(): any {
    return { 
      message: 'Controlador de reportes UNIFICADO funcionando correctamente ✅',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      caracteristicas: [
        'Dashboard unificado con datos reales',
        'Gráficos interactivos con Chart.js',
        'Exportación PDF/Excel funcional',
        'Sistema de alertas integrado',
        'KPIs calculados en tiempo real',
        'Soporte para múltiples períodos'
      ],
      endpoints: [
        'GET /api/reportes/dashboard - Dashboard principal unificado',
        'GET /api/reportes/graficos?tipo=... - Datos específicos para gráficos',
        'GET /api/reportes/reporte/:tipo - Reportes específicos',
        'GET /api/reportes/alertas - Alertas financieras',
        'POST /api/reportes/exportar/pdf - Exportar PDF',
        'POST /api/reportes/exportar/excel - Exportar Excel'
      ]
    };
  }

  /**
   * Calcular fechas según el período seleccionado
   */
  private calcularFechasPeriodo(periodo: string): { fechaInicio: Date; fechaFin: Date } {
    const hoy = new Date();
    let fechaInicio: Date;
    let fechaFin: Date = new Date(hoy);

    switch (periodo) {
      case 'semana':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        break;
      
      case 'trimestre':
        const quarterStart = Math.floor(hoy.getMonth() / 3) * 3;
        fechaInicio = new Date(hoy.getFullYear(), quarterStart, 1);
        fechaFin = new Date(hoy.getFullYear(), quarterStart + 3, 0);
        break;
      
      case 'año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        fechaFin = new Date(hoy.getFullYear(), 11, 31);
        break;
      
      default:
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    }

    return { fechaInicio, fechaFin };
  }

  /**
   * Obtener descripción legible del período
   */
  private getDescripcionPeriodo(periodo: string, fechaInicio: Date, fechaFin: Date): string {
    const formatoFecha = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    switch (periodo) {
      case 'semana':
        return `Última semana (${formatoFecha.format(fechaInicio)} - ${formatoFecha.format(fechaFin)})`;
      case 'mes':
        return `${fechaInicio.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      case 'trimestre':
        const trimestre = Math.floor(fechaInicio.getMonth() / 3) + 1;
        return `${trimestre}° Trimestre ${fechaInicio.getFullYear()}`;
      case 'año':
        return `Año ${fechaInicio.getFullYear()}`;
      default:
        return `${formatoFecha.format(fechaInicio)} - ${formatoFecha.format(fechaFin)}`;
    }
  }
}
