import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
declare const JwtAccessStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtAccessStrategy extends JwtAccessStrategy_base {
    private configService;
    private authService;
    constructor(configService: ConfigService, authService: AuthService);
    validate(payload: any): Promise<{
        sub: any;
        email: any;
        rol: any;
        deviceId: any;
        csrfToken: any;
        usuario: import("../../usuarios/schemas/usuario.schema").UsuarioDocument;
    }>;
}
export {};
