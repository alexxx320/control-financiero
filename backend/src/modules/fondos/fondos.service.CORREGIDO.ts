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

  /**
   * ELIMINACIÓN COMPLETA: Elimina el fondo y TODAS sus transacciones asociadas
   */
  async remove(id: string, usuarioId: string): Promise<void> {
    console.log(`🗑️ Backend - Iniciando eliminación COMPLETA del fondo: ${id}`);
    
    // Verificar que el fondo existe
    const fondo = await this.findOne(id, usuarioId);
    console.log(`📋 Fondo encontrado: "${fondo.nombre}"`);
    
    // Buscar transacciones asociadas
    const transaccionesAsociadas = await this.transaccionModel.find({ 
      fondoId: new Types.ObjectId(id),
      usuarioId: new Types.ObjectId(usuarioId)
    });
    
    console.log(`📊 Transacciones asociadas encontradas: ${transaccionesAsociadas.length}`);
    
    if (transaccionesAsociadas.length > 0) {
      console.log(`🔥 Eliminando ${transaccionesAsociadas.length} transacciones asociadas...`);
      
      // ELIMINAR TODAS LAS TRANSACCIONES ASOCIADAS
      const resultadoTransacciones = await this.transaccionModel.deleteMany({ 
        fondoId: new Types.ObjectId(id),
        usuarioId: new Types.ObjectId(usuarioId)
      });
      
      console.log(`✅ Transacciones eliminadas: ${resultadoTransacciones.deletedCount}`);
    } else {
      console.log(`ℹ️ No hay transacciones asociadas para eliminar`);
    }
    
    // ELIMINAR EL FONDO COMPLETAMENTE
    console.log(`🔥 Eliminando fondo "${fondo.nombre}" de la base de datos...`);
    
    const resultadoFondo = await this.fondoModel
      .findOneAndDelete({
        _id: id, 
        usuarioId: new Types.ObjectId(usuarioId)
      })
      .exec();

    if (!resultadoFondo) {
      throw new NotFoundException(`Error: No se pudo eliminar el fondo con ID "${id}"`);
    }
    
    console.log(`✅ Backend - Eliminación COMPLETA exitosa:`);
    console.log(`   📁 Fondo eliminado: "${fondo.nombre}"`);
    console.log(`   📊 Transacciones eliminadas: ${transaccionesAsociadas.length}`);
    console.log(`   🗃️ Eliminación física de la base de datos completada`);
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
}
