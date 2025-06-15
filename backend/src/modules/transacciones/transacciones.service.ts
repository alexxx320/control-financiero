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
    // Verificar que el fondo existe y pertenece al usuario
    await this.fondosService.findOne(createTransaccionDto.fondoId, usuarioId);

    const nuevaTransaccion = new this.transaccionModel({
      ...createTransaccionDto,
      usuarioId: new Types.ObjectId(usuarioId),
      fondoId: new Types.ObjectId(createTransaccionDto.fondoId),
      fecha: new Date(),
    });

    return await nuevaTransaccion.save();
  }

  async findAll(usuarioId: string, filtros: FiltroTransaccionesDto = {}): Promise<{
    transacciones: Transaccion[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    const {
      tipo,
      categoria,
      fechaInicio,
      fechaFin,
      montoMin,
      montoMax,
      pagina = 1,
      limite = 10
    } = filtros;

    // Construir filtros de consulta
    const filtrosConsulta: any = {
      usuarioId: new Types.ObjectId(usuarioId)
    };

    if (tipo) filtrosConsulta.tipo = tipo;
    if (categoria) filtrosConsulta.categoria = categoria;
    
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

    // Calcular paginación
    const skip = (pagina - 1) * limite;

    // Ejecutar consultas
    const [transacciones, total] = await Promise.all([
      this.transaccionModel
        .find(filtrosConsulta)
        .populate('fondoId', 'nombre tipo')
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limite)
        .exec(),
      this.transaccionModel.countDocuments(filtrosConsulta),
    ]);

    return {
      transacciones,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async findByFondo(fondoId: string, usuarioId: string, filtros: FiltroTransaccionesDto = {}): Promise<Transaccion[]> {
    // Verificar que el fondo existe y pertenece al usuario
    await this.fondosService.findOne(fondoId, usuarioId);

    const filtrosConsulta: any = { 
      fondoId: new Types.ObjectId(fondoId),
      usuarioId: new Types.ObjectId(usuarioId)
    };

    // Aplicar filtros adicionales
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
    // Verificar que la transacción existe y pertenece al usuario
    await this.findOne(id, usuarioId);

    const transaccionActualizada = await this.transaccionModel
      .findOneAndUpdate(
        { _id: id, usuarioId: new Types.ObjectId(usuarioId) },
        updateTransaccionDto, 
        { new: true }
      )
      .populate('fondoId', 'nombre tipo')
      .exec();

    return transaccionActualizada;
  }

  async remove(id: string, usuarioId: string): Promise<void> {
    const transaccion = await this.findOne(id, usuarioId);
    await this.transaccionModel.findOneAndDelete({
      _id: id,
      usuarioId: new Types.ObjectId(usuarioId)
    }).exec();
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
