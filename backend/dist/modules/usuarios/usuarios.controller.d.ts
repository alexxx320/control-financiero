import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from '@/common/dto/usuario.dto';
import { Usuario, RolUsuario } from './schemas/usuario.schema';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    findAll(): Promise<Usuario[]>;
    buscarUsuarios(termino: string): Promise<Usuario[]>;
    obtenerEstadisticas(): Promise<{
        totalUsuarios: number;
        usuariosActivos: number;
        usuariosInactivos: number;
        usuariosPorRol: {
            [key: string]: number;
        };
        registrosUltimos30Dias: number;
    }>;
    obtenerMiPerfil(userId: string): Promise<Usuario>;
    actualizarMiPerfil(userId: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario>;
    actualizarMisPreferencias(userId: string, preferencias: Partial<Usuario['preferencias']>): Promise<Usuario>;
    actualizarMiAvatar(userId: string, avatarUrl: string): Promise<Usuario>;
    findOne(id: string): Promise<Usuario>;
    update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario>;
    cambiarRol(id: string, nuevoRol: RolUsuario): Promise<Usuario>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
