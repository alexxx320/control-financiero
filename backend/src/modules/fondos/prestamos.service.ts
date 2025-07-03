import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prestamo, PrestamoDocument } from './schemas/prestamo.schema';
import { PagoPrestamo, PagoPrestamoDocument } from './schemas/pago-prestamo.schema';
import { Fondo, FondoDocument } from './schemas/fondo.schema';
import { CreatePrestamoDto, UpdatePrestamoDto, CreatePagoPrestamoDto, EstadoPrestamo, TipoPago } from '@/common/dto/prestamo.dto';
import { FondosService } from './fondos.service';
import { TipoTransaccion, TipoFondo } from '@/common/interfaces/financiero.interface';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectModel(Prestamo.name) private prestamoModel: Model<PrestamoDocument>,
    @InjectModel(PagoPrestamo.name) private pagoPrestamoModel: Model<PagoPrestamoDocument>,
    @InjectModel(Fondo.name) private fondoModel: Model<FondoDocument>,
    private fondosService: FondosService,
  ) {}

  async create(createPrestamoDto: CreatePrestamoDto, usuarioId: string): Promise<Prestamo> {
    console.log(`💰 [PRESTAMOS] Creando préstamo para usuario ${usuarioId}:`, createPrestamoDto);
    
    // Verificar que el fondo existe y es de tipo préstamo
    const fondo = await this.fondosService.findOne(createPrestamoDto.fondoId, usuarioId);
    
    if (fondo.tipo !== TipoFondo.PRESTAMO) {
      throw new BadRequestException('Solo se pueden crear préstamos en fondos de tipo "préstamo"');
    }

    // Verificar saldo suficiente en el fondo
    if (fondo.saldoActual < createPrestamoDto.montoOriginal) {
      throw new BadRequestException(`Saldo insuficiente en el fondo. Disponible: ${fondo.saldoActual}, Requerido: ${createPrestamoDto.montoOriginal}`);
    }

    const nuevoPrestamo = new this.prestamoModel({
      ...createPrestamoDto,
      usuarioId: new Types.ObjectId(usuarioId),
      fondoId: new Types.ObjectId(createPrestamoDto.fondoId),
      fechaPrestamo: createPrestamoDto.fechaPrestamo || new Date(),
      montoAbonado: 0,
      estado: EstadoPrestamo.ACTIVO,
      activo: true,
    });

    const prestamoGuardado = await nuevoPrestamo.save();
    
    // Actualizar saldo del fondo (restar el monto prestado)
    await this.fondosService.actualizarSaldo(
      createPrestamoDto.fondoId,
      TipoTransaccion.GASTO,
      createPrestamoDto.montoOriginal,
      usuarioId
    );

    console.log(`✅ [PRESTAMOS] Préstamo creado exitosamente:`, {
      id: prestamoGuardado._id,
      deudor: prestamoGuardado.nombreDeudor,
      monto: prestamoGuardado.montoOriginal
    });
    
    return prestamoGuardado;
  }

  async findAll(usuarioId: string, fondoId?: string): Promise<Prestamo[]> {
    const filtro: any = { 
      usuarioId: new Types.ObjectId(usuarioId),
      activo: true 
    };
    
    if (fondoId) {
      filtro.fondoId = new Types.ObjectId(fondoId);
    }

    return await this.prestamoModel
      .find(filtro)
      .sort({ fechaPrestamo: -1 })
      .exec();
  }

  async findOne(id: string, usuarioId: string): Promise<Prestamo> {
    const prestamo = await this.prestamoModel.findOne({
      _id: id,
      usuarioId: new Types.ObjectId(usuarioId)
    }).exec();
    
    if (!prestamo) {
      throw new NotFoundException(`Préstamo con ID "${id}" no encontrado`);
    }
    
    return prestamo;
  }

  async update(id: string, updatePrestamoDto: UpdatePrestamoDto, usuarioId: string): Promise<Prestamo> {
    console.log(`🔄 [PRESTAMOS] Actualizando préstamo ${id}:`, updatePrestamoDto);
    
    // Verificar que el préstamo existe y pertenece al usuario
    await this.findOne(id, usuarioId);

    const prestamoActualizado = await this.prestamoModel
      .findOneAndUpdate(
        { _id: id, usuarioId: new Types.ObjectId(usuarioId) },
        updatePrestamoDto, 
        { new: true }
      )
      .exec();

    console.log(`✅ [PRESTAMOS] Préstamo actualizado exitosamente:`, {
      id: prestamoActualizado._id,
      deudor: prestamoActualizado.nombreDeudor,
      estado: prestamoActualizado.estado
    });

    return prestamoActualizado;
  }

  async remove(id: string, usuarioId: string): Promise<void> {
    console.log(`🗑️ Eliminando préstamo ${id}...`);
    
    const prestamo = await this.findOne(id, usuarioId);
    
    // Si el préstamo no está completamente pagado, devolver el saldo al fondo
    const saldoPendiente = prestamo.montoOriginal - prestamo.montoAbonado;
    if (saldoPendiente > 0) {
      await this.fondosService.actualizarSaldo(
        prestamo.fondoId.toString(),
        TipoTransaccion.INGRESO,
        saldoPendiente,
        usuarioId
      );
      console.log(`💰 Devuelto saldo pendiente de ${saldoPendiente} al fondo`);
    }
    
    // Eliminar todos los pagos asociados
    await this.pagoPrestamoModel.deleteMany({
      prestamoId: new Types.ObjectId(id),
      usuarioId: new Types.ObjectId(usuarioId)
    }).exec();
    
    // Eliminar el préstamo
    await this.prestamoModel
      .findOneAndDelete({
        _id: id, 
        usuarioId: new Types.ObjectId(usuarioId)
      })
      .exec();
      
    console.log(`✅ Préstamo eliminado exitosamente`);
  }

  async registrarPago(createPagoDto: CreatePagoPrestamoDto, usuarioId: string): Promise<PagoPrestamo> {
    console.log(`💳 [PRESTAMOS] Registrando pago:`, createPagoDto);
    
    const prestamo = await this.findOne(createPagoDto.prestamoId, usuarioId);
    
    // Verificar que el préstamo esté activo
    if (prestamo.estado === EstadoPrestamo.PAGADO) {
      throw new BadRequestException('Este préstamo ya está completamente pagado');
    }
    
    // Verificar que el monto no exceda el saldo pendiente
    const saldoPendiente = prestamo.montoOriginal - prestamo.montoAbonado;
    if (createPagoDto.monto > saldoPendiente) {
      throw new BadRequestException(`El pago de ${createPagoDto.monto} excede el saldo pendiente de ${saldoPendiente}`);
    }

    // Determinar el tipo de pago automáticamente
    const tipoPago = createPagoDto.monto === saldoPendiente ? TipoPago.PAGO_TOTAL : TipoPago.ABONO;

    const nuevoPago = new this.pagoPrestamoModel({
      ...createPagoDto,
      usuarioId: new Types.ObjectId(usuarioId),
      prestamoId: new Types.ObjectId(createPagoDto.prestamoId),
      fondoId: prestamo.fondoId,
      fechaPago: createPagoDto.fechaPago || new Date(),
      tipo: tipoPago,
      activo: true,
    });

    const pagoGuardado = await nuevoPago.save();
    
    // Actualizar el monto abonado en el préstamo
    const nuevoMontoAbonado = prestamo.montoAbonado + createPagoDto.monto;
    let nuevoEstado: EstadoPrestamo = prestamo.estado;
    
    if (nuevoMontoAbonado >= prestamo.montoOriginal) {
      nuevoEstado = EstadoPrestamo.PAGADO;
    } else if (nuevoMontoAbonado > 0) {
      nuevoEstado = EstadoPrestamo.PARCIAL;
    }

    await this.prestamoModel.findByIdAndUpdate(
      createPagoDto.prestamoId,
      { 
        montoAbonado: nuevoMontoAbonado,
        estado: nuevoEstado
      }
    );
    
    // Actualizar saldo del fondo (sumar el pago recibido)
    await this.fondosService.actualizarSaldo(
      prestamo.fondoId.toString(),
      TipoTransaccion.INGRESO,
      createPagoDto.monto,
      usuarioId
    );

    console.log(`✅ [PRESTAMOS] Pago registrado exitosamente:`, {
      prestamo: prestamo.nombreDeudor,
      monto: createPagoDto.monto,
      tipo: tipoPago,
      nuevoEstado
    });
    
    return pagoGuardado;
  }

  async obtenerPagosPrestamo(prestamoId: string, usuarioId: string): Promise<PagoPrestamo[]> {
    return await this.pagoPrestamoModel
      .find({ 
        prestamoId: new Types.ObjectId(prestamoId),
        usuarioId: new Types.ObjectId(usuarioId),
        activo: true 
      })
      .sort({ fechaPago: -1 })
      .exec();
  }

  async obtenerEstadisticas(usuarioId: string, fondoId?: string): Promise<any> {
    const filtro: any = { usuarioId: new Types.ObjectId(usuarioId) };
    if (fondoId) {
      filtro.fondoId = new Types.ObjectId(fondoId);
    }

    const prestamos = await this.prestamoModel.find(filtro).exec();
    
    const totalPrestamos = prestamos.length;
    const prestamosActivos = prestamos.filter(p => p.estado === EstadoPrestamo.ACTIVO || p.estado === EstadoPrestamo.PARCIAL).length;
    const prestamosPagados = prestamos.filter(p => p.estado === EstadoPrestamo.PAGADO).length;
    const prestamosVencidos = prestamos.filter(p => p.estado === EstadoPrestamo.VENCIDO).length;
    
    const montoTotalPrestado = prestamos.reduce((sum, p) => sum + p.montoOriginal, 0);
    const montoTotalRecuperado = prestamos.reduce((sum, p) => sum + p.montoAbonado, 0);
    const saldoPendienteTotal = prestamos.reduce((sum, p) => sum + (p.montoOriginal - p.montoAbonado), 0);
    
    const porcentajeRecuperacion = montoTotalPrestado > 0 
      ? (montoTotalRecuperado / montoTotalPrestado) * 100 
      : 0;

    return {
      totalPrestamos,
      prestamosActivos,
      prestamosPagados,
      prestamosVencidos,
      montoTotalPrestado,
      montoTotalRecuperado,
      saldoPendienteTotal,
      porcentajeRecuperacion: Math.round(porcentajeRecuperacion * 100) / 100
    };
  }

  async obtenerResumenPorDeudor(usuarioId: string, fondoId?: string): Promise<any[]> {
    const filtro: any = { usuarioId: new Types.ObjectId(usuarioId) };
    if (fondoId) {
      filtro.fondoId = new Types.ObjectId(fondoId);
    }

    const prestamos = await this.prestamoModel.find(filtro).exec();
    
    // Agrupar por deudor
    const resumenPorDeudor = new Map();
    
    for (const prestamo of prestamos) {
      const deudor = prestamo.nombreDeudor;
      
      if (!resumenPorDeudor.has(deudor)) {
        resumenPorDeudor.set(deudor, {
          nombreDeudor: deudor,
          totalPrestamos: 0,
          montoTotalPrestado: 0,
          montoTotalAbonado: 0,
          saldoPendiente: 0,
          prestamos: []
        });
      }
      
      const resumen = resumenPorDeudor.get(deudor);
      resumen.totalPrestamos++;
      resumen.montoTotalPrestado += prestamo.montoOriginal;
      resumen.montoTotalAbonado += prestamo.montoAbonado;
      resumen.saldoPendiente += (prestamo.montoOriginal - prestamo.montoAbonado);
      resumen.prestamos.push(prestamo);
    }
    
    return Array.from(resumenPorDeudor.values())
      .sort((a, b) => b.saldoPendiente - a.saldoPendiente);
  }

  async actualizarEstadosVencidos(): Promise<number> {
    const ahora = new Date();
    
    const resultado = await this.prestamoModel.updateMany(
      {
        fechaVencimiento: { $lt: ahora },
        estado: { $in: [EstadoPrestamo.ACTIVO, EstadoPrestamo.PARCIAL] }
      },
      { estado: EstadoPrestamo.VENCIDO }
    );
    
    console.log(`🗓️ [PRESTAMOS] ${resultado.modifiedCount} préstamos marcados como vencidos`);
    
    return resultado.modifiedCount;
  }
}
