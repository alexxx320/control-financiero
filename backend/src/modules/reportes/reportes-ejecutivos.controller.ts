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
import { ReportesEjecutivosService, IReporteEjecutivo } from './reportes-ejecutivos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface ReportRequest {
  fechaInicio: string;
  fechaFin: string;
  tipo: 'mensual' | 'trimestral' | 'anual' | 'personalizado';
}

@Controller('api/reportes/ejecutivos')
@UseGuards(JwtAuthGuard)
export class ReportesEjecutivosController {
  constructor(
    private readonly reportesEjecutivosService: ReportesEjecutivosService
  ) {}

  @Get('dashboard')
  async obtenerDashboardData(
    @Query('periodo') periodo: string = 'mes',
    @Req() req: any
  ): Promise<any> {
    console.log(`📊 Obteniendo datos de dashboard ejecutivo - período: ${periodo}`);
    
    const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);
    
    const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(
      req.user.userId,
      fechaInicio,
      fechaFin
    );

    // Formatear datos para el dashboard frontend
    return {
      kpis: reporte.kpis,
      tendenciaMensual: reporte.tendenciaMensual,
      distribucionCategorias: reporte.distribucionCategorias.slice(0, 8), // Top 8
      fondosPerformance: reporte.fondosPerformance.slice(0, 5), // Top 5
      flujoCaja: reporte.flujoCaja.slice(-14), // Últimos 14 días
      periodo: reporte.periodo
    };
  }

  @Post('exportar/pdf')
  async exportarPDF(
    @Body() request: { periodo: string },
    @Req() req: any,
    @Res() res: Response
  ): Promise<void> {
    console.log(`📄 Exportando reporte a PDF para usuario ${req.user.userId}`);
    
    try {
      const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(request.periodo);
      
      // Generar reporte
      const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(
        req.user.userId,
        fechaInicio,
        fechaFin
      );
      
      // Exportar a PDF
      const pdfBuffer = await this.reportesEjecutivosService.exportarPDF(reporte);
      
      // Configurar headers para descarga
      const fileName = `reporte-ejecutivo-${fechaInicio.toISOString().split('T')[0]}-${fechaFin.toISOString().split('T')[0]}.pdf`;
      
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

  @Post('exportar/excel')
  async exportarExcel(
    @Body() request: { periodo: string },
    @Req() req: any,
    @Res() res: Response
  ): Promise<void> {
    console.log(`📊 Exportando reporte a Excel para usuario ${req.user.userId}`);
    
    try {
      const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(request.periodo);
      
      // Generar reporte
      const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(
        req.user.userId,
        fechaInicio,
        fechaFin
      );
      
      // Exportar a Excel
      const excelBuffer = await this.reportesEjecutivosService.exportarExcel(reporte);
      
      // Configurar headers para descarga
      const fileName = `reporte-ejecutivo-${fechaInicio.toISOString().split('T')[0]}-${fechaFin.toISOString().split('T')[0]}.xlsx`;
      
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

  @Get('kpis')
  async obtenerKPIs(
    @Query('periodo') periodo: string = 'mes',
    @Req() req: any
  ): Promise<any> {
    console.log(`📈 Obteniendo KPIs ejecutivos - período: ${periodo}`);
    
    const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);
    
    const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(
      req.user.userId,
      fechaInicio,
      fechaFin
    );

    return {
      kpis: reporte.kpis,
      periodo: reporte.periodo.descripcion
    };
  }

  @Get('graficos')
  async obtenerDatosGraficos(
    @Query('periodo') periodo: string = 'mes',
    @Query('tipo') tipo: string = 'tendencia',
    @Req() req: any
  ): Promise<any> {
    console.log(`📊 Obteniendo datos para gráficos: ${tipo} - período: ${periodo}`);
    
    const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);
    
    const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(
      req.user.userId,
      fechaInicio,
      fechaFin
    );

    switch (tipo) {
      case 'tendencia':
        return {
          data: reporte.tendenciaMensual,
          tipo: 'line'
        };
      
      case 'categorias':
        return {
          data: reporte.distribucionCategorias,
          tipo: 'pie'
        };
      
      case 'fondos':
        return {
          data: reporte.fondosPerformance,
          tipo: 'bar'
        };
      
      case 'flujo':
        return {
          data: reporte.flujoCaja,
          tipo: 'area'
        };
      
      default:
        return {
          data: reporte.tendenciaMensual,
          tipo: 'line'
        };
    }
  }

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
        break;
      
      case 'trimestre':
        const quarterStart = Math.floor(hoy.getMonth() / 3) * 3;
        fechaInicio = new Date(hoy.getFullYear(), quarterStart, 1);
        break;
      
      case 'año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1);
        break;
      
      default:
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }

    return { fechaInicio, fechaFin };
  }
}
