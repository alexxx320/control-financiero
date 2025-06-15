import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'secreto-super-seguro-para-desarrollo'),
    });
  }

  async validate(payload: any) {
    try {
      const usuario = await this.authService.obtenerUsuarioPorId(payload.sub);
      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      return {
        userId: payload.sub,
        email: payload.email,
        rol: payload.rol,
        usuario: usuario,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
