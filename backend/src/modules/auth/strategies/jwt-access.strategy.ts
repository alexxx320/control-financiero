import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    // Verificar que el payload sea de un access token
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token type inválido');
    }

    // Verificar que el usuario sigue existiendo y activo
    try {
      const usuario = await this.authService.obtenerUsuarioPorId(payload.sub);
      
      return {
        sub: payload.sub,
        email: payload.email,
        rol: payload.rol,
        deviceId: payload.deviceId,
        csrfToken: payload.csrfToken,
        usuario
      };
    } catch (error) {
      throw new UnauthorizedException('Usuario no válido');
    }
  }
}
