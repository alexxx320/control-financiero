import { AuthService } from './auth.service';
import { CreateUsuarioDto, LoginDto, AuthResponseDto, CambiarPasswordDto } from '@/common/dto/usuario.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    testAuth(): {
        message: string;
        timestamp: string;
        endpoints: {
            login: string;
            registro: string;
            perfil: string;
        };
    };
    registro(createUsuarioDto: CreateUsuarioDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    obtenerPerfil(user: any): Promise<{
        id: any;
        email: any;
        nombre: any;
        apellido: any;
        rol: any;
        telefono: any;
        avatar: any;
        preferencias: any;
        fechaRegistro: any;
        ultimoLogin: any;
    }>;
    renovarToken(userId: string): Promise<AuthResponseDto>;
    cambiarPassword(userId: string, cambiarPasswordDto: CambiarPasswordDto): Promise<{
        message: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
    verificarEmail(email: string): Promise<{
        disponible: boolean;
    }>;
}
