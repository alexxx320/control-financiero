import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseIntPipe,
  BadRequestException,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TransaccionesService } from './transacciones.service';
import { CreateTransaccionDto, UpdateTransaccionDto, FiltroTransaccionesDto } from '@/common/dto/transaccion.dto';
import { Transaccion } from './schemas/transaccion.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@ApiTags('transacciones')
@Controller('transacciones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva transacción' })
  @ApiResponse({ 
    status: 201, 
    description: 'Transacción creada exitosamente',
    type: Transaccion
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  async create(
    @Body() createTransaccionDto: CreateTransaccionDto,
    @GetUser('userId') usuarioId: string
  ): Promise<Transaccion> {
    return await this.transaccionesService.create(createTransaccionDto, usuarioId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas mis transacciones con filtros y paginación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de transacciones obtenida exitosamente' 
  })
  async findAll(
    @Query() filtros: FiltroTransaccionesDto,
    @GetUser('userId') usuarioId: string
  ) {
    return await this.transaccionesService.findAll(usuarioId, filtros);
  }

  @Get('estadisticas/categorias')
  @ApiOperation({ summary: 'Obtener estadísticas por categoría' })
  @ApiQuery({ name: 'fondoId', required: false, description: 'ID del fondo para filtrar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas por categoría obtenidas exitosamente' 
  })
  async getEstadisticasPorCategoria(@Query('fondoId') fondoId?: string) {
    return await this.transaccionesService.getEstadisticasPorCategoria(fondoId);
  }

  @Get('resumen/:año/:mes')
  @ApiOperation({ summary: 'Obtener resumen mensual de transacciones' })
  @ApiParam({ name: 'año', description: 'Año para el resumen' })
  @ApiParam({ name: 'mes', description: 'Mes para el resumen (1-12)' })
  @ApiQuery({ name: 'fondoId', required: false, description: 'ID del fondo para filtrar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resumen mensual obtenido exitosamente' 
  })
  async getResumenMensual(
    @Param('año', ParseIntPipe) año: number,
    @Param('mes', ParseIntPipe) mes: number,
    @Query('fondoId') fondoId?: string
  ) {
    if (mes < 1 || mes > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    return await this.transaccionesService.getResumenMensual(año, mes, fondoId);
  }

  @Get('fondo/:fondoId')
  @ApiOperation({ summary: 'Obtener transacciones de un fondo específico' })
  @ApiParam({ name: 'fondoId', description: 'ID del fondo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transacciones del fondo obtenidas exitosamente',
    type: [Transaccion]
  })
  async findByFondo(
    @Param('fondoId') fondoId: string,
    @Query() filtros: FiltroTransaccionesDto,
    @GetUser('userId') usuarioId: string
  ): Promise<Transaccion[]> {
    return await this.transaccionesService.findByFondo(fondoId, usuarioId, filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una transacción por ID' })
  @ApiParam({ name: 'id', description: 'ID de la transacción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transacción encontrada',
    type: Transaccion
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Transacción no encontrada' 
  })
  async findOne(
    @Param('id') id: string,
    @GetUser('userId') usuarioId: string
  ): Promise<Transaccion> {
    return await this.transaccionesService.findOne(id, usuarioId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una transacción' })
  @ApiParam({ name: 'id', description: 'ID de la transacción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transacción actualizada exitosamente',
    type: Transaccion
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Transacción no encontrada' 
  })
  async update(
    @Param('id') id: string, 
    @Body() updateTransaccionDto: UpdateTransaccionDto,
    @GetUser('userId') usuarioId: string
  ): Promise<Transaccion> {
    return await this.transaccionesService.update(id, updateTransaccionDto, usuarioId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una transacción' })
  @ApiParam({ name: 'id', description: 'ID de la transacción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transacción eliminada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Transacción no encontrada' 
  })
  async remove(
    @Param('id') id: string,
    @GetUser('userId') usuarioId: string
  ): Promise<{ message: string }> {
    await this.transaccionesService.remove(id, usuarioId);
    return { message: 'Transacción eliminada exitosamente' };
  }
}
