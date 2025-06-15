import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Fondo, FondoDocument } from './schemas/fondo.schema';
import { CreateFondoDto, UpdateFondoDto } from '@/common/dto/fondo.dto';

@Injectable()
export class FondosService {
  constructor(
    @InjectModel(Fondo.name) private fondoModel: Model<FondoDocument>,
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
    const fondo = await this.findOne(id, usuarioId);
    
    // Soft delete - marcar como inactivo en lugar de eliminar
    await this.fondoModel
      .findOneAndUpdate(
        { _id: id, usuarioId: new Types.ObjectId(usuarioId) },
        { activo: false }
      )
      .exec();
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
}
