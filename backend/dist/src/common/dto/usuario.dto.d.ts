import { RolUsuario } from '../../modules/usuarios/schemas/usuario.schema';
export declare class CreateUsuarioDto {
    email: string;
    nombre: string;
    apellido: string;
    password: string;
    telefono?: string;
    rol?: RolUsuario;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class UpdateUsuarioDto {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    avatar?: string;
    preferencias?: {
        monedaPrincipal?: string;
        formatoFecha?: string;
        notificacionesEmail?: boolean;
        notificacionesAlertas?: boolean;
    };
}
export declare class CambiarPasswordDto {
    passwordActual: string;
    passwordNueva: string;
}
export declare class AuthResponseDto {
    access_token: string;
    usuario: {
        id: string;
        email: string;
        nombre: string;
        apellido: string;
        rol: RolUsuario;
    };
    expires_in: number;
}
