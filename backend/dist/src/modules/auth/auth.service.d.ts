import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { CreateUsuarioDto, LoginDto, AuthResponseDto } from '@/common/dto/usuario.dto';
export declare class AuthService {
    private usuarioModel;
    private jwtService;
    constructor(usuarioModel: Model<UsuarioDocument>, jwtService: JwtService);
    registro(createUsuarioDto: CreateUsuarioDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    validarUsuario(email: string, password: string): Promise<any>;
    obtenerUsuarioPorId(userId: string): Promise<UsuarioDocument>;
    verificarToken(token: string): Promise<any>;
    cambiarPassword(userId: string, passwordActual: string, passwordNueva: string): Promise<void>;
    obtenerUsuarioPorEmail(email: string): Promise<Usuario>;
    renovarToken(userId: string): Promise<AuthResponseDto>;
}
