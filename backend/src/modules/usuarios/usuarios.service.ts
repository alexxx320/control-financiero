import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument, RolUsuario } from './schemas/usuario.schema';
import { UpdateUsuarioDto } from '@/common/dto/usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioModel
      .find({ activo: true })
      .select('-password')
      .sort({ fechaRegistro: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findById(id)
      .select('-password')
      .exec();
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
    
    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, updateUsuarioDto, { new: true })
      .select('-password')
      .exec();

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    return usuario;
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    
    // Soft delete - marcar como inactivo
    await this.usuarioModel
      .findByIdAndUpdate(id, { activo: false })
      .exec();
  }

  async findByEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findOne({ email: email.toLowerCase(), activo: true })
      .select('-password')
      .exec();
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con email "${email}" no encontrado`);
    }
    
    return usuario;
  }

  async updatePreferencias(
    id: string, 
    preferencias: Partial<Usuario['preferencias']>
  ): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(
        id, 
        { $set: { preferencias } }, 
        { new: true }
      )
      .select('-password')
      .exec();

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    return usuario;
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(
        id, 
        { avatar: avatarUrl }, 
        { new: true }
      )
      .select('-password')
      .exec();

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    return usuario;
  }

  async cambiarRol(id: string, nuevoRol: RolUsuario): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(
        id, 
        { rol: nuevoRol }, 
        { new: true }
      )
      .select('-password')
      .exec();

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    return usuario;
  }

  async obtenerEstadisticas(): Promise<{
    totalUsuarios: number;
    usuariosActivos: number;
    usuariosInactivos: number;
    usuariosPorRol: { [key: string]: number };
    registrosUltimos30Dias: number;
  }> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const [
      totalUsuarios,
      usuariosActivos,
      usuariosInactivos,
      registrosRecientes,
      usuariosPorRol
    ] = await Promise.all([
      this.usuarioModel.countDocuments(),
      this.usuarioModel.countDocuments({ activo: true }),
      this.usuarioModel.countDocuments({ activo: false }),
      this.usuarioModel.countDocuments({ 
        fechaRegistro: { $gte: fechaLimite } 
      }),
      this.usuarioModel.aggregate([
        { $group: { _id: '$rol', count: { $sum: 1 } } }
      ])
    ]);

    const rolesMap = {};
    usuariosPorRol.forEach(item => {
      rolesMap[item._id] = item.count;
    });

    return {
      totalUsuarios,
      usuariosActivos,
      usuariosInactivos,
      usuariosPorRol: rolesMap,
      registrosUltimos30Dias: registrosRecientes,
    };
  }

  async buscarUsuarios(termino: string): Promise<Usuario[]> {
    return await this.usuarioModel
      .find({
        activo: true,
        $or: [
          { nombre: { $regex: termino, $options: 'i' } },
          { apellido: { $regex: termino, $options: 'i' } },
          { email: { $regex: termino, $options: 'i' } },
        ],
      })
      .select('-password')
      .limit(20)
      .exec();
  }
}
