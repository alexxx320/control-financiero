import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { FondosService } from '../fondos/fondos.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly fondosService: FondosService,
  ) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Obtener resumen completo para el dashboard' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resumen del dashboard obtenido exitosamente' 
  })
  async obtenerResumenDashboard(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @GetUser('userId') usuarioId?: string
  ) {
    console.log('📊 DashboardController - Obteniendo resumen para usuario:', usuarioId);
    
    try {
      // Obtener datos del dashboard en paralelo
      const [resumenFinanciero, estadisticas, fondos] = await Promise.all([
        this.dashboardService.obtenerResumenFinanciero(usuarioId, fechaInicio, fechaFin),
        this.dashboardService.obtenerEstadisticas(usuarioId, fechaInicio, fechaFin),
        this.fondosService.findAll(usuarioId)
      ]);

      // Obtener fecha actual para período
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const añoActual = fechaActual.getFullYear();

      const resumen = {
        // Resumen financiero
        resumenFinanciero,

        // Estadísticas del dashboard
        estadisticas,

        // Fondos detallados
        fondos: fondos.map(fondo => ({
          ...fondo,
          id: (fondo as any)._id?.toString() || (fondo as any).id,
          progresoMeta: this.calcularProgresoMeta(fondo)
        })),

        // Metadatos
        periodo: {
          mes: mesActual,
          año: añoActual,
          descripcion: fechaActual.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
          })
        },

        // Estado de la conexión
        timestamp: new Date().toISOString(),
        conectado: true
      };

      console.log('✅ DashboardController - Resumen generado exitosamente para usuario:', usuarioId);
      return resumen;

    } catch (error) {
      console.error('❌ DashboardController - Error al generar resumen:', error);
      throw error;
    }
  }

  @Get('conectividad')
  @ApiOperation({ summary: 'Verificar conectividad del backend' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de conectividad verificado' 
  })
  async verificarConectividad() {
    const conectado = await this.dashboardService.verificarConectividad();
    return { conectado, timestamp: new Date().toISOString() };
  }

  @Get('resumen-financiero')
  @ApiOperation({ summary: 'Obtener solo el resumen financiero' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resumen financiero obtenido exitosamente' 
  })
  async obtenerResumenFinanciero(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @GetUser('userId') usuarioId?: string
  ) {
    return await this.dashboardService.obtenerResumenFinanciero(usuarioId, fechaInicio, fechaFin);
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener solo las estadísticas del dashboard' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente' 
  })
  async obtenerEstadisticas(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @GetUser('userId') usuarioId?: string
  ) {
    return await this.dashboardService.obtenerEstadisticas(usuarioId, fechaInicio, fechaFin);
  }
  
  @Get('datos-grafico')
  @ApiOperation({ summary: 'Obtener datos para el gráfico de tendencias' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Datos del gráfico obtenidos exitosamente' 
  })
  async obtenerDatosGrafico(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @GetUser('userId') usuarioId?: string
  ) {
    return await this.dashboardService.obtenerDatosGrafico(usuarioId, fechaInicio, fechaFin);
  }

  @Get('alertas')
  @ApiOperation({ summary: 'Obtener alertas personalizadas para el dashboard' })
  @ApiResponse({ 
    status: 200, 
    description: 'Alertas obtenidas exitosamente' 
  })
  async obtenerAlertasDashboard(@GetUser('userId') usuarioId: string) {
    console.log('🚨 DashboardController - Obteniendo alertas para usuario:', usuarioId);
    
    try {
      const alertasPersonalizadas = await this.generarAlertasPersonalizadas(usuarioId);
      
      return {
        alertas: alertasPersonalizadas,
        total: alertasPersonalizadas.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error al obtener alertas:', error);
      return {
        alertas: [],
        total: 0,
        error: 'No se pudieron cargar las alertas'
      };
    }
  }

  @Get('estadisticas-rapidas')
  @ApiOperation({ summary: 'Obtener estadísticas rápidas para el dashboard' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas rápidas obtenidas exitosamente' 
  })
  async obtenerEstadisticasRapidas(@GetUser('userId') usuarioId: string) {
    console.log('⚡ DashboardController - Obteniendo estadísticas rápidas para usuario:', usuarioId);
    
    try {
      const [fondos, estadisticas] = await Promise.all([
        this.fondosService.findAll(usuarioId),
        this.dashboardService.obtenerEstadisticas(usuarioId)
      ]);

      return {
        fondosActivos: fondos.filter(f => f.activo).length,
        totalFondos: fondos.length,
        balanceTotal: estadisticas.mayorIngreso - estadisticas.mayorGasto, // Aproximación
        transaccionesTotal: estadisticas.transaccionesMes,
        promedioGastoMensual: estadisticas.mayorGasto,
        fondoMayorBalance: fondos.length > 0 ? fondos[0].nombre : 'N/A',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas rápidas:', error);
      return {
        fondosActivos: 0,
        totalFondos: 0,
        balanceTotal: 0,
        transaccionesTotal: 0,
        promedioGastoMensual: 0,
        fondoMayorBalance: 'N/A',
        error: 'No se pudieron cargar las estadísticas'
      };
    }
  }

  // Métodos auxiliares privados
  private procesarFondosPorTipo(fondos: any[]): any[] {
    const tiposMap = new Map();
    
    fondos.forEach(fondo => {
      // Obtener el primer fondo para determinar el tipo (simplificado)
      const tipo = this.determinarTipoFondo(fondo.nombre);
      
      if (!tiposMap.has(tipo)) {
        tiposMap.set(tipo, {
          tipo,
          cantidad: 0,
          montoTotal: 0,
          progreso: 0
        });
      }
      
      const tipoData = tiposMap.get(tipo);
      tipoData.cantidad += 1;
      tipoData.montoTotal += fondo.balanceFinal || 0;
    });
    
    // Calcular progreso basado en metas promedio
    tiposMap.forEach((value) => {
      value.progreso = Math.min((value.montoTotal / 1000000) * 100, 100);
    });
    
    return Array.from(tiposMap.values());
  }

  private determinarTipoFondo(nombre: string): string {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('ahorro')) return 'ahorro';
    if (nombreLower.includes('emergencia')) return 'emergencia';
    if (nombreLower.includes('personal') || nombreLower.includes('vacacion')) return 'personal';
    if (nombreLower.includes('inversion')) return 'inversion';
    return 'otros';
  }

  private calcularProgresoMeta(fondo: any): number {
    if (!fondo.metaAhorro || fondo.metaAhorro === 0) {
      return 0;
    }
    const progreso = (fondo.saldoActual / fondo.metaAhorro) * 100;
    return Math.min(Math.round(progreso), 100);
  }

  private calcularMayorIngreso(fondos: any[]): number {
    if (!fondos || fondos.length === 0) return 0;
    
    return fondos.reduce((max, fondo) => {
      return Math.max(max, fondo.ingresos || 0);
    }, 0);
  }

  private async obtenerTransaccionesHoy(usuarioId: string): Promise<number> {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);

      // Esto requeriría un método en TransaccionesService
      // Por ahora retornamos un valor estimado
      return Math.floor(Math.random() * 5); // Simulado por ahora
    } catch (error) {
      console.error('Error al obtener transacciones de hoy:', error);
      return 0;
    }
  }

  private async generarAlertasPersonalizadas(usuarioId: string): Promise<any[]> {
    try {
      const fondos = await this.fondosService.findAll(usuarioId);
      const alertas = [];

      // Alerta por fondos sin meta
      const fondosSinMeta = fondos.filter(f => !f.metaAhorro || f.metaAhorro === 0);
      if (fondosSinMeta.length > 0) {
        alertas.push({
          tipo: 'INFO',
          fondo: 'General',
          mensaje: `${fondosSinMeta.length} fondo(s) sin meta de ahorro definida`,
          prioridad: 'BAJA'
        });
      }

      // Alerta por fondos inactivos
      const fondosInactivos = fondos.filter(f => !f.activo);
      if (fondosInactivos.length > 0) {
        alertas.push({
          tipo: 'ADVERTENCIA',
          fondo: 'General',
          mensaje: `${fondosInactivos.length} fondo(s) inactivo(s)`,
          prioridad: 'MEDIA'
        });
      }

      return alertas;
    } catch (error) {
      console.error('Error al generar alertas personalizadas:', error);
      return [];
    }
  }
}
