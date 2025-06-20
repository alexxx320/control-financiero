import { Controller, Get, Query, BadRequestException, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@ApiTags('reportes')
@Controller('reportes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
    @GetUser('userId') usuarioId: string
  ) {
    console.log(`📊 ReportesController - Generando reporte mensual para usuario: ${usuarioId}`);
    
    if (mes < 1 || mes > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    return await this.reportesService.generarReporteMensual(mes, año, usuarioId);
  }

  @Get('anual')
  @ApiOperation({ summary: 'Generar reporte anual' })
  @ApiQuery({ name: 'año', description: 'Año para el reporte' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte anual generado exitosamente' 
  })
  async generarReporteAnual(
    @Query('año', ParseIntPipe) año: number,
    @GetUser('userId') usuarioId: string
  ) {
    console.log(`📅 ReportesController - Generando reporte anual para usuario: ${usuarioId}`);
    return await this.reportesService.generarReporteAnual(año, usuarioId);
  }

  @Get('alertas')
  @ApiOperation({ summary: 'Obtener alertas financieras' })
  @ApiResponse({ 
    status: 200, 
    description: 'Alertas obtenidas exitosamente' 
  })
  async obtenerAlertas(@GetUser('userId') usuarioId: string) {
    console.log(`🚨 ReportesController - Obteniendo alertas para usuario: ${usuarioId}`);
    return await this.reportesService.obtenerAlertasFinancieras(usuarioId);
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas generales del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente' 
  })
  async obtenerEstadisticas(@GetUser('userId') usuarioId: string) {
    console.log(`📈 ReportesController - Obteniendo estadísticas para usuario: ${usuarioId}`);
    return await this.reportesService.obtenerEstadisticasGenerales(usuarioId);
  }
}
