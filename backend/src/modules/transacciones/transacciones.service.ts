import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaccion, TransaccionDocument } from './schemas/transaccion.schema';
import { CreateTransaccionDto, UpdateTransaccionDto, FiltroTransaccionesDto } from '@/common/dto/transaccion.dto';
import { FondosService } from '../fondos/fondos.service';

@Injectable()
export class TransaccionesService {
  constructor(
    @InjectModel(Transaccion.name) private transaccionModel: Model<TransaccionDocument>,
    private fondosService: FondosService,
  ) {}

  async create(createTransaccionDto: CreateTransaccionDto, usuarioId: string): Promise<Transaccion> {
    console.log('💰 CREAR TRANSACCIÓN - Actualizando saldo del fondo');
    console.log('📊 Datos de creación:', createTransaccionDto);
    
    // Verificar que el fondo existe y pertenece al usuario
    const fondo = await this.fondosService.findOne(createTransaccionDto.fondoId, usuarioId);

    // Verificar si el gasto excede el saldo disponible
    if (createTransaccionDto.tipo === 'gasto' && fondo.saldoActual < createTransaccionDto.monto) {
      console.warn(`⚠️ Gasto mayor al saldo disponible: Fondo "${fondo.nombre}" tiene ${fondo.saldoActual}, gasto solicitado: ${createTransaccionDto.monto}`);
    }

    // ACTUALIZAR EL SALDO DEL FONDO
    await this.fondosService.actualizarSaldo(
      createTransaccionDto.fondoId, 
      createTransaccionDto.tipo, 
      createTransaccionDto.monto, 
      usuarioId
    );

    const nuevaTransaccion = new this.transaccionModel({
      ...createTransaccionDto,
      usuarioId: new Types.ObjectId(usuarioId),
      fondoId: new Types.ObjectId(createTransaccionDto.fondoId),
      fecha: createTransaccionDto.fecha || new Date(),
    });

    const transaccionGuardada = await nuevaTransaccion.save();
    console.log('✅ Transacción creada y saldo actualizado');
    
    // Devolver la transacción con el fondo populado
    return await this.transaccionModel
      .findById(transaccionGuardada._id)
      .populate('fondoId', 'nombre tipo')
      .exec();
  }

  async findAll(usuarioId: string, filtros: FiltroTransaccionesDto = {}): Promise<{
    transacciones: Transaccion[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      tipo,
      categoria,
      fondoId, // 🔍 Agregado filtro por fondo
      fechaInicio,
      fechaFin,
      montoMin,
      montoMax,
      page = 1,
      limit = 10,
      pagina,
      limite
    } = filtros;

    console.log('🔍 Backend - Filtros recibidos:', {
      tipo, categoria, fondoId, fechaInicio, fechaFin, page, limit
    });

    const pageNum = page || pagina || 1;
    const limitNum = limit || limite || 10;

    const filtrosConsulta: any = {
      usuarioId: new Types.ObjectId(usuarioId)
    };

    if (tipo) filtrosConsulta.tipo = tipo;
    if (categoria) filtrosConsulta.categoria = categoria;
    
    // 🏦 FILTRO POR FONDO
    if (fondoId) {
      filtrosConsulta.fondoId = new Types.ObjectId(fondoId);
      console.log('🏦 Backend - Aplicando filtro por fondo:', fondoId);
    }
    
    if (fechaInicio || fechaFin) {
      filtrosConsulta.fecha = {};
      if (fechaInicio) filtrosConsulta.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filtrosConsulta.fecha.$lte = new Date(fechaFin);
    }

    if (montoMin !== undefined || montoMax !== undefined) {
      filtrosConsulta.monto = {};
      if (montoMin !== undefined) filtrosConsulta.monto.$gte = montoMin;
      if (montoMax !== undefined) filtrosConsulta.monto.$lte = montoMax;
    }

    console.log('🔍 Backend - Query MongoDB construida:', filtrosConsulta);

    const skip = (pageNum - 1) * limitNum;

    const [transacciones, total] = await Promise.all([
      this.transaccionModel
        .find(filtrosConsulta)
        .populate({
          path: 'fondoId',
          select: 'nombre tipo descripcion',
          strictPopulate: false
        })
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limitNum)
        .exec(),
      this.transaccionModel.countDocuments(filtrosConsulta),
    ]);

    console.log(`✅ Backend - Encontradas ${transacciones.length} transacciones de ${total} totales`);

    return {
      transacciones,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findByFondo(fondoId: string, usuarioId: string, filtros: FiltroTransaccionesDto = {}): Promise<Transaccion[]> {
    await this.fondosService.findOne(fondoId, usuarioId);

    const filtrosConsulta: any = { 
      fondoId: new Types.ObjectId(fondoId),
      usuarioId: new Types.ObjectId(usuarioId)
    };

    if (filtros.tipo) filtrosConsulta.tipo = filtros.tipo;
    if (filtros.categoria) filtrosConsulta.categoria = filtros.categoria;
    
    if (filtros.fechaInicio || filtros.fechaFin) {
      filtrosConsulta.fecha = {};
      if (filtros.fechaInicio) filtrosConsulta.fecha.$gte = new Date(filtros.fechaInicio);
      if (filtros.fechaFin) filtrosConsulta.fecha.$lte = new Date(filtros.fechaFin);
    }

    return await this.transaccionModel
      .find(filtrosConsulta)
      .sort({ fecha: -1 })
      .exec();
  }

  async findOne(id: string, usuarioId: string): Promise<Transaccion> {
    const transaccion = await this.transaccionModel
      .findOne({
        _id: id,
        usuarioId: new Types.ObjectId(usuarioId)
      })
      .populate('fondoId', 'nombre tipo')
      .exec();
    
    if (!transaccion) {
      throw new NotFoundException(`Transacción con ID "${id}" no encontrada`);
    }
    
    return transaccion;
  }

  async update(id: string, updateTransaccionDto: UpdateTransaccionDto, usuarioId: string): Promise<Transaccion> {
    console.log('🔄 EDITAR TRANSACCIÓN - Recalculando saldo del fondo');
    console.log('📊 Datos de actualización:', updateTransaccionDto);
    
    // 1. Obtener la transacción original
    const transaccionOriginal = await this.findOne(id, usuarioId);
    
    // Extraer el fondoId correctamente
    const fondoOriginalId = typeof transaccionOriginal.fondoId === 'object' && transaccionOriginal.fondoId._id 
      ? transaccionOriginal.fondoId._id.toString()
      : transaccionOriginal.fondoId.toString();
    
    console.log('📋 Transacción original:', {
      tipo: transaccionOriginal.tipo,
      monto: transaccionOriginal.monto,
      fondoId: fondoOriginalId
    });
    
    // 2. REVERTIR el efecto de la transacción original
    console.log('🔄 PASO 1: Revirtiendo efecto original...');
    const tipoOriginalInverso = transaccionOriginal.tipo === 'ingreso' ? 'gasto' : 'ingreso';
    await this.fondosService.actualizarSaldo(
      fondoOriginalId,
      tipoOriginalInverso,
      transaccionOriginal.monto,
      usuarioId
    );
    console.log('✅ Efecto original revertido');
    
    // 3. Determinar los nuevos valores
    const nuevoTipo = updateTransaccionDto.tipo || transaccionOriginal.tipo;
    const nuevoMonto = updateTransaccionDto.monto !== undefined ? updateTransaccionDto.monto : transaccionOriginal.monto;
    const nuevoFondoId = updateTransaccionDto.fondoId || fondoOriginalId;
    
    console.log('📊 Nuevos valores a aplicar:', { nuevoTipo, nuevoMonto, nuevoFondoId });
    
    // 4. APLICAR el nuevo efecto
    console.log('🔄 PASO 2: Aplicando nuevos valores...');
    await this.fondosService.actualizarSaldo(
      nuevoFondoId,
      nuevoTipo,
      nuevoMonto,
      usuarioId
    );
    console.log('✅ Nuevos valores aplicados al saldo');

    // 5. Preparar datos para actualización
    const updateData: any = {};
    if (updateTransaccionDto.descripcion !== undefined) updateData.descripcion = updateTransaccionDto.descripcion;
    if (updateTransaccionDto.monto !== undefined) updateData.monto = updateTransaccionDto.monto;
    if (updateTransaccionDto.tipo !== undefined) updateData.tipo = updateTransaccionDto.tipo;
    if (updateTransaccionDto.categoria !== undefined) updateData.categoria = updateTransaccionDto.categoria;
    if (updateTransaccionDto.notas !== undefined) updateData.notas = updateTransaccionDto.notas;
    if (updateTransaccionDto.etiquetas !== undefined) updateData.etiquetas = updateTransaccionDto.etiquetas;
    if (updateTransaccionDto.fondoId !== undefined) updateData.fondoId = new Types.ObjectId(updateTransaccionDto.fondoId);

    // 6. Actualizar la transacción en la base de datos
    const transaccionActualizada = await this.transaccionModel
      .findOneAndUpdate(
        { _id: id, usuarioId: new Types.ObjectId(usuarioId) },
        updateData, 
        { new: true }
      )
      .populate('fondoId', 'nombre tipo')
      .exec();

    console.log('✅ Transacción editada y saldo recalculado');
    return transaccionActualizada;
  }

  async remove(id: string, usuarioId: string): Promise<void> {
    console.log('🗑️ ELIMINAR TRANSACCIÓN - Revirtiendo saldo del fondo');
    
    // 1. Obtener la transacción antes de eliminarla
    const transaccion = await this.findOne(id, usuarioId);
    
    // Extraer el fondoId correctamente
    const fondoId = typeof transaccion.fondoId === 'object' && transaccion.fondoId._id 
      ? transaccion.fondoId._id.toString()
      : transaccion.fondoId.toString();
    
    console.log('📋 Transacción a eliminar:', {
      tipo: transaccion.tipo,
      monto: transaccion.monto,
      descripcion: transaccion.descripcion,
      fondoId: fondoId
    });
    
    // 2. REVERTIR el efecto en el saldo del fondo
    console.log('🔄 Revirtiendo efecto en el saldo...');
    const tipoInverso = transaccion.tipo === 'ingreso' ? 'gasto' : 'ingreso';
    await this.fondosService.actualizarSaldo(
      fondoId,
      tipoInverso,
      transaccion.monto,
      usuarioId
    );
    console.log('✅ Efecto revertido en el saldo');
    
    // 3. Eliminar la transacción
    await this.transaccionModel.findOneAndDelete({
      _id: id,
      usuarioId: new Types.ObjectId(usuarioId)
    }).exec();
    
    console.log('✅ Transacción eliminada y saldo revertido');
  }

  async getEstadisticasPorCategoria(fondoId?: string): Promise<Array<{
    categoria: string;
    total: number;
    cantidad: number;
    promedio: number;
  }>> {
    const filtros: any = {};
    if (fondoId) {
      filtros.fondoId = new Types.ObjectId(fondoId);
    }

    const estadisticas = await this.transaccionModel.aggregate([
      { $match: filtros },
      {
        $group: {
          _id: '$categoria',
          total: { $sum: '$monto' },
          cantidad: { $sum: 1 },
          promedio: { $avg: '$monto' },
        },
      },
      {
        $project: {
          categoria: '$_id',
          total: 1,
          cantidad: 1,
          promedio: { $round: ['$promedio', 2] },
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]);

    return estadisticas;
  }

  async getResumenMensual(año: number, mes: number, fondoId?: string): Promise<{
    ingresos: number;
    gastos: number;
    balance: number;
    transacciones: number;
  }> {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);

    const filtros: any = {
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    };

    if (fondoId) {
      filtros.fondoId = new Types.ObjectId(fondoId);
    }

    const resumen = await this.transaccionModel.aggregate([
      { $match: filtros },
      {
        $group: {
          _id: null,
          ingresos: {
            $sum: {
              $cond: [{ $eq: ['$tipo', 'ingreso'] }, '$monto', 0]
            }
          },
          gastos: {
            $sum: {
              $cond: [{ $eq: ['$tipo', 'gasto'] }, '$monto', 0]
            }
          },
          transacciones: { $sum: 1 },
        },
      },
      {
        $project: {
          ingresos: 1,
          gastos: 1,
          balance: { $subtract: ['$ingresos', '$gastos'] },
          transacciones: 1,
          _id: 0,
        },
      },
    ]);

    return resumen[0] || { ingresos: 0, gastos: 0, balance: 0, transacciones: 0 };
  }
}
