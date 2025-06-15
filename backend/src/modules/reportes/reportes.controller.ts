import { Controller, Get, Query, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';

@ApiTags('reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('mensual')
  @ApiOperation({ summary: 'Generar reporte mensual' })
  @ApiQuery({ name: 'mes', description: 'Mes (1-12)' })
  @ApiQuery({ name: 'año', description: 'Año' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte mensual generado exitosamente' 
  })
  async generarReporteMensual(
    @Query('mes', ParseIntPipe) mes: number,
    @Query('año', ParseIntPipe) año: number,
  ) {
    if (mes < 1 || mes > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    return await this.reportesService.generarReporteMensual(mes, año);
  }

  @Get('anual')
  @ApiOperation({ summary: 'Generar reporte anual' })
  @ApiQuery({ name: 'año', description: 'Año para el reporte' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte anual generado exitosamente' 
  })
  async generarReporteAnual(@Query('año', ParseIntPipe) año: number) {
    return await this.reportesService.generarReporteAnual(año);
  }

  @Get('alertas')
  @ApiOperation({ summary: 'Obtener alertas financieras' })
  @ApiResponse({ 
    status: 200, 
    description: 'Alertas obtenidas exitosamente' 
  })
  async obtenerAlertas() {
    return await this.reportesService.obtenerAlertasFinancieras();
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas generales del sistema' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente' 
  })
  async obtenerEstadisticas() {
    return await this.reportesService.obtenerEstadisticasGenerales();
  }
}
