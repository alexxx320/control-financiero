import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PrestamosService } from './prestamos.service';
import { CreatePrestamoDto, UpdatePrestamoDto, CreatePagoPrestamoDto } from '@/common/dto/prestamo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('prestamos')
@UseGuards(JwtAuthGuard)
export class PrestamosController {
  constructor(private readonly prestamosService: PrestamosService) {}

  @Post()
  async create(@Body() createPrestamoDto: CreatePrestamoDto, @Request() req) {
    return this.prestamosService.create(createPrestamoDto, req.user.sub);
  }

  @Get()
  async findAll(@Request() req, @Query('fondoId') fondoId?: string) {
    return this.prestamosService.findAll(req.user.sub, fondoId);
  }

  @Get('estadisticas')
  async obtenerEstadisticas(@Request() req, @Query('fondoId') fondoId?: string) {
    return this.prestamosService.obtenerEstadisticas(req.user.sub, fondoId);
  }

  @Get('resumen-deudores')
  async obtenerResumenDeudores(@Request() req, @Query('fondoId') fondoId?: string) {
    return this.prestamosService.obtenerResumenPorDeudor(req.user.sub, fondoId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.prestamosService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePrestamoDto: UpdatePrestamoDto, @Request() req) {
    return this.prestamosService.update(id, updatePrestamoDto, req.user.sub);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.prestamosService.remove(id, req.user.sub);
  }

  @Post(':id/pagos')
  async registrarPago(@Param('id') prestamoId: string, @Body() createPagoDto: CreatePagoPrestamoDto, @Request() req) {
    // Asegurar que el prestamoId coincida
    createPagoDto.prestamoId = prestamoId;
    return this.prestamosService.registrarPago(createPagoDto, req.user.sub);
  }

  @Get(':id/pagos')
  async obtenerPagos(@Param('id') prestamoId: string, @Request() req) {
    return this.prestamosService.obtenerPagosPrestamo(prestamoId, req.user.sub);
  }

  @Post('actualizar-vencidos')
  async actualizarVencidos() {
    return this.prestamosService.actualizarEstadosVencidos();
  }
}
