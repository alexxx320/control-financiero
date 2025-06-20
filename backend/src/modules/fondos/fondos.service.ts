import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Fondo, FondoDocument } from './schemas/fondo.schema';
import { Transaccion, TransaccionDocument } from '../transacciones/schemas/transaccion.schema';
import { CreateFondoDto, UpdateFondoDto } from '@/common/dto/fondo.dto';

@Injectable()
export class FondosService {
  constructor(
    @InjectModel(Fondo.name) private fondoModel: Model<FondoDocument>,
    @InjectModel(Transaccion.name) private transaccionModel: Model<TransaccionDocument>,
  ) {}

  async create(createFondoDto: CreateFondoDto, usuarioId: string): Promise<Fondo> {
    // Verificar que no exista un fondo con el mismo nombre para este usuario
    const fondoExistente = await this.fondoModel.findOne({ 
      nombre: createFondoDto.nombre,
      usuarioId: new Types.ObjectId(usuarioId)
    });
    
    if (fondoExistente) {
      throw new BadRequestException(`Ya existe un fondo con el nombre "${createFondoDto.nombre}"`);
    }

    const nuevoFondo = new this.fondoModel({
      ...createFondoDto,
      usuarioId: new Types.ObjectId(usuarioId),
      saldoActual: createFondoDto.saldoActual || 0, // Default 0 si no se especifica
      metaAhorro: createFondoDto.metaAhorro || 0,
      fechaCreacion: new Date(),
      activo: true,
    });

    return await nuevoFondo.save();
  }

  async findAll(usuarioId: string): Promise<Fondo[]> {
    return await this.fondoModel
      .find({ 
        usuarioId: new Types.ObjectId(usuarioId),
        activo: true 
      })
      .sort({ fechaCreacion: -1 })
      .exec();
  }

  async findOne(id: string, usuarioId: string): Promise<Fondo> {
    const fondo = await this.fondoModel.findOne({
      _id: id,
      usuarioId: new Types.ObjectId(usuarioId)
    }).exec();
    
    if (!fondo) {
      throw new NotFoundException(`Fondo con ID "${id}" no encontrado`);
    }
    
    return fondo;
  }

  async update(id: string, updateFondoDto: UpdateFondoDto, usuarioId: string): Promise<Fondo> {
    // Verificar que el fondo existe y pertenece al usuario
    const fondoExistente = await this.findOne(id, usuarioId);

    // Si se está actualizando el nombre, verificar que no exista otro fondo con ese nombre
    if (updateFondoDto.nombre && updateFondoDto.nombre !== fondoExistente.nombre) {
      const nombreDuplicado = await this.fondoModel.findOne({ 
        nombre: updateFondoDto.nombre,
        usuarioId: new Types.ObjectId(usuarioId),
        _id: { $ne: id }
      });
      
      if (nombreDuplicado) {
        throw new BadRequestException(`Ya existe un fondo con el nombre "${updateFondoDto.nombre}"`);
      }
    }

    const fondoActualizado = await this.fondoModel
      .findOneAndUpdate(
        { _id: id, usuarioId: new Types.ObjectId(usuarioId) },
        updateFondoDto, 
        { new: true }
      )
      .exec();

    return fondoActualizado;
  }

  async remove(id: string, usuarioId: string): Promise<void> {
    console.log(`🗑️ Eliminando fondo ${id} y sus transacciones asociadas...`);
    
    // Verificar que el fondo existe
    const fondo = await this.findOne(id, usuarioId);
    
    // Contar transacciones asociadas
    const transaccionesCount = await this.transaccionModel.countDocuments({ 
      fondoId: new Types.ObjectId(id),
      usuarioId: new Types.ObjectId(usuarioId)
    });
    
    if (transaccionesCount > 0) {
      console.log(`📋 Eliminando ${transaccionesCount} transacción(es) asociadas al fondo "${fondo.nombre}"...`);
      
      // Eliminar todas las transacciones asociadas al fondo
      await this.transaccionModel.deleteMany({
        fondoId: new Types.ObjectId(id),
        usuarioId: new Types.ObjectId(usuarioId)
      }).exec();
      
      console.log(`✅ ${transaccionesCount} transacción(es) eliminadas`);
    }
    
    // Eliminar el fondo
    await this.fondoModel
      .findOneAndDelete({
        _id: id, 
        usuarioId: new Types.ObjectId(usuarioId)
      })
      .exec();
      
    console.log(`✅ Fondo "${fondo.nombre}" eliminado exitosamente`);
  }

  async findByTipo(tipo: string, usuarioId: string): Promise<Fondo[]> {
    return await this.fondoModel
      .find({ 
        tipo, 
        usuarioId: new Types.ObjectId(usuarioId),
        activo: true 
      })
      .sort({ fechaCreacion: -1 })
      .exec();
  }

  async getTotalFondos(usuarioId: string): Promise<number> {
    return await this.fondoModel.countDocuments({ 
      usuarioId: new Types.ObjectId(usuarioId),
      activo: true 
    });
  }

  async getFondosConMetas(usuarioId: string): Promise<Fondo[]> {
    return await this.fondoModel
      .find({ 
        usuarioId: new Types.ObjectId(usuarioId),
        activo: true,
        metaAhorro: { $gt: 0 }
      })
      .sort({ metaAhorro: -1 })
      .exec();
  }

  /**
   * Actualizar saldo del fondo cuando hay transacciones
   */
  async actualizarSaldo(fondoId: string, tipo: 'ingreso' | 'gasto', monto: number, usuarioId: string): Promise<Fondo> {
    const fondo = await this.findOne(fondoId, usuarioId);
    
    const nuevoSaldo = tipo === 'ingreso' 
      ? fondo.saldoActual + monto
      : fondo.saldoActual - monto;
    
    // Permitir saldos negativos pero registrar la situación
    if (nuevoSaldo < 0) {
      console.warn(`⚠️ Saldo negativo en fondo "${fondo.nombre}": ${nuevoSaldo}`);
    }
    
    return await this.fondoModel
      .findOneAndUpdate(
        { _id: fondoId, usuarioId: new Types.ObjectId(usuarioId) },
        { saldoActual: nuevoSaldo },
        { new: true }
      )
      .exec();
  }

  /**
   * Obtener estadísticas personalizadas para el dashboard
   */
  async getEstadisticasPersonalizadas(usuarioId: string): Promise<{
    totalFondos: number;
    fondosActivos: number;
    fondosConMetas: number;
    metaPromedioAhorro: number;
    saldoTotalActual: number;
    fondoMayorSaldo: { nombre: string; saldo: number } | null;
    progresoPromedioMetas: number;
  }> {
    const fondos = await this.fondoModel
      .find({ 
        usuarioId: new Types.ObjectId(usuarioId)
      })
      .exec();

    const fondosActivos = fondos.filter(f => f.activo);
    const fondosConMetas = fondosActivos.filter(f => f.metaAhorro && f.metaAhorro > 0);
    
    const saldoTotal = fondosActivos.reduce((sum, f) => sum + f.saldoActual, 0);
    const metaPromedio = fondosConMetas.length > 0 
      ? fondosConMetas.reduce((sum, f) => sum + f.metaAhorro, 0) / fondosConMetas.length 
      : 0;

    // Encontrar fondo con mayor saldo
    let fondoMayorSaldo = null;
    if (fondosActivos.length > 0) {
      const fondoMaximo = fondosActivos.reduce((prev, current) => 
        prev.saldoActual > current.saldoActual ? prev : current
      );
      fondoMayorSaldo = {
        nombre: fondoMaximo.nombre,
        saldo: fondoMaximo.saldoActual
      };
    }

    // Calcular progreso promedio de metas
    let progresoPromedio = 0;
    if (fondosConMetas.length > 0) {
      const progresoTotal = fondosConMetas.reduce((sum, f) => {
        const progreso = (f.saldoActual / f.metaAhorro) * 100;
        return sum + Math.min(progreso, 100);
      }, 0);
      progresoPromedio = progresoTotal / fondosConMetas.length;
    }

    return {
      totalFondos: fondos.length,
      fondosActivos: fondosActivos.length,
      fondosConMetas: fondosConMetas.length,
      metaPromedioAhorro: metaPromedio,
      saldoTotalActual: saldoTotal,
      fondoMayorSaldo,
      progresoPromedioMetas: Math.round(progresoPromedio * 100) / 100
    };
  }
}
