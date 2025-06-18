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
    console.log('JWT Strategy - Payload recibido:', payload);
    
    try {
      const usuario = await this.authService.obtenerUsuarioPorId(payload.sub);
      if (!usuario) {
        console.error('Usuario no encontrado en BD con ID:', payload.sub);
        throw new UnauthorizedException('Usuario no encontrado');
      }
      
      const userObject = {
        userId: payload.sub,
        email: payload.email,
        rol: payload.rol,
        usuario: usuario,
      };
      
      console.log('JWT Strategy - Objeto usuario devuelto:', userObject);
      return userObject;
    } catch (error) {
      console.error('Error en JWT Strategy validate:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
