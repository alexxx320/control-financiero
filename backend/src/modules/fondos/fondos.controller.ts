import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FondosService } from './fondos.service';
import { CreateFondoDto, UpdateFondoDto } from '@/common/dto/fondo.dto';
import { Fondo } from './schemas/fondo.schema';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('fondos')
@Controller('fondos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FondosController {
  constructor(private readonly fondosService: FondosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo fondo' })
  @ApiResponse({ 
    status: 201, 
    description: 'Fondo creado exitosamente',
    type: Fondo
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o fondo ya existe' 
  })
  async create(
    @Body() createFondoDto: CreateFondoDto,
    @GetUser('userId') usuarioId: string
  ): Promise<Fondo> {
    console.log('FondosController - Crear fondo para usuario:', usuarioId);
    return await this.fondosService.create(createFondoDto, usuarioId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos mis fondos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de fondos obtenida exitosamente',
    type: [Fondo]
  })
  @ApiQuery({ 
    name: 'tipo', 
    required: false, 
    description: 'Filtrar por tipo de fondo' 
  })
  @ApiQuery({ 
    name: 'incluirInactivos', 
    required: false, 
    description: 'Incluir fondos inactivos en la respuesta',
    type: 'boolean'
  })
  async findAll(
    @Query('tipo') tipo: string,
    @Query('incluirInactivos') incluirInactivos: string,
    @GetUser('userId') usuarioId: string
  ): Promise<Fondo[]> {
    console.log('FondosController - Obtener fondos para usuario:', usuarioId);
    const incluirInactivosBool = incluirInactivos === 'true';
    
    if (tipo) {
      return await this.fondosService.findByTipo(tipo, usuarioId, incluirInactivosBool);
    }
    return await this.fondosService.findAll(usuarioId, incluirInactivosBool);
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de mis fondos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente' 
  })
  async getEstadisticas(@GetUser('userId') usuarioId: string) {
    const totalFondos = await this.fondosService.getTotalFondos(usuarioId);
    const fondosConMetas = await this.fondosService.getFondosConMetas(usuarioId);
    
    return {
      totalFondos,
      fondosConMetas: fondosConMetas.length,
      metaPromedioAhorro: fondosConMetas.length > 0 
        ? fondosConMetas.reduce((sum, f) => sum + f.metaAhorro, 0) / fondosConMetas.length 
        : 0
    };
  }

  @Get('estadisticas/prestamos')
  @ApiOperation({ summary: 'Obtener estadísticas específicas de préstamos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de préstamos obtenidas exitosamente' 
  })
  async getEstadisticasPrestamos(@GetUser('userId') usuarioId: string) {
    return await this.fondosService.getEstadisticasPrestamos(usuarioId);
  }

  @Get(':id/progreso-prestamo')
  @ApiOperation({ summary: 'Obtener progreso de pago de un préstamo específico' })
  @ApiParam({ name: 'id', description: 'ID del fondo préstamo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Progreso del préstamo obtenido exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Fondo no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'El fondo no es de tipo préstamo' 
  })
  async getProgresoPrestamo(
    @Param('id') id: string,
    @GetUser('userId') usuarioId: string
  ) {
    const fondo = await this.fondosService.findOne(id, usuarioId);
    return this.fondosService.getProgresoPrestamo(fondo);
  }

  @Get('estadisticas/deudas')
  @ApiOperation({ summary: 'Obtener estadísticas específicas de deudas' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de deudas obtenidas exitosamente' 
  })
  async getEstadisticasDeudas(@GetUser('userId') usuarioId: string) {
    return await this.fondosService.getEstadisticasDeudas(usuarioId);
  }

  @Get(':id/progreso-deuda')
  @ApiOperation({ summary: 'Obtener progreso de pago de una deuda específica' })
  @ApiParam({ name: 'id', description: 'ID del fondo deuda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Progreso de la deuda obtenido exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Fondo no encontrado' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'El fondo no es de tipo deuda' 
  })
  async getProgresoDeuda(
    @Param('id') id: string,
    @GetUser('userId') usuarioId: string
  ) {
    const fondo = await this.fondosService.findOne(id, usuarioId);
    return this.fondosService.getProgresoDeuda(fondo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un fondo por ID' })
  @ApiParam({ name: 'id', description: 'ID del fondo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Fondo encontrado',
    type: Fondo
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Fondo no encontrado' 
  })
  async findOne(
    @Param('id') id: string,
    @GetUser('userId') usuarioId: string
  ): Promise<Fondo> {
    return await this.fondosService.findOne(id, usuarioId);
  }

  @Patch(':id/toggle-estado')
  @ApiOperation({ summary: 'Activar o desactivar un fondo' })
  @ApiParam({ name: 'id', description: 'ID del fondo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del fondo actualizado exitosamente',
    type: Fondo
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Fondo no encontrado' 
  })
  async toggleEstado(
    @Param('id') id: string,
    @GetUser('userId') usuarioId: string
  ): Promise<{ fondo: Fondo; message: string }> {
    console.log('🔄 Backend - Cambiando estado del fondo:', { id, usuarioId });
    
    const fondoActualizado = await this.fondosService.toggleEstado(id, usuarioId);
    const mensaje = `Fondo ${fondoActualizado.activo ? 'activado' : 'desactivado'} exitosamente`;
    
    console.log('✅ Backend - Estado del fondo actualizado:', {
      id: fondoActualizado._id,
      nombre: fondoActualizado.nombre,
      activo: fondoActualizado.activo
    });
    
    return {
      fondo: fondoActualizado,
      message: mensaje
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un fondo' })
  @ApiParam({ name: 'id', description: 'ID del fondo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Fondo actualizado exitosamente',
    type: Fondo
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Fondo no encontrado' 
  })
  async update(
    @Param('id') id: string, 
    @Body() updateFondoDto: UpdateFondoDto,
    @GetUser('userId') usuarioId: string
  ): Promise<Fondo> {
    return await this.fondosService.update(id, updateFondoDto, usuarioId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un fondo (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del fondo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Fondo eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Fondo no encontrado' 
  })
  async remove(
    @Param('id') id: string,
    @GetUser('userId') usuarioId: string
  ): Promise<{ message: string }> {
    console.log('🗑️ Backend - Eliminando fondo:', { id, usuarioId });
    
    await this.fondosService.remove(id, usuarioId);
    const resultado = { message: 'Fondo eliminado exitosamente' };
    
    console.log('✅ Backend - Fondo eliminado exitosamente:', resultado);
    return resultado;
  }
}
