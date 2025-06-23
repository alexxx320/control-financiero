import { Model } from 'mongoose';
import { Usuario, UsuarioDocument, RolUsuario } from './schemas/usuario.schema';
import { UpdateUsuarioDto } from '@/common/dto/usuario.dto';
export declare class UsuariosService {
    private usuarioModel;
    constructor(usuarioModel: Model<UsuarioDocument>);
    findAll(): Promise<Usuario[]>;
    findOne(id: string): Promise<Usuario>;
    update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario>;
    remove(id: string): Promise<void>;
    findByEmail(email: string): Promise<Usuario>;
    updatePreferencias(id: string, preferencias: Partial<Usuario['preferencias']>): Promise<Usuario>;
    updateAvatar(id: string, avatarUrl: string): Promise<Usuario>;
    cambiarRol(id: string, nuevoRol: RolUsuario): Promise<Usuario>;
    obtenerEstadisticas(): Promise<{
        totalUsuarios: number;
        usuariosActivos: number;
        usuariosInactivos: number;
        usuariosPorRol: {
            [key: string]: number;
        };
        registrosUltimos30Dias: number;
    }>;
    buscarUsuarios(termino: string): Promise<Usuario[]>;
}
