import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FondosService } from './fondos.service';
import { CreateFondoDto, UpdateFondoDto } from '@/common/dto/fondo.dto';
import { Fondo } from './schemas/fondo.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

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
    return await this.fondosService.create(createFondoDto, usuarioId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos mis fondos activos' })
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
  async findAll(
    @Query('tipo') tipo: string,
    @GetUser('userId') usuarioId: string
  ): Promise<Fondo[]> {
    if (tipo) {
      return await this.fondosService.findByTipo(tipo, usuarioId);
    }
    return await this.fondosService.findAll(usuarioId);
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
    await this.fondosService.remove(id, usuarioId);
    return { message: 'Fondo eliminado exitosamente' };
  }
}
