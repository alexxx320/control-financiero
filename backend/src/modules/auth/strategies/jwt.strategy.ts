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
    const jwtSecret = configService.get<string>('JWT_SECRET', 'secreto-super-seguro-para-desarrollo');
    console.log('🔑 JWT Strategy inicializado con secret:', jwtSecret.substring(0, 10) + '...');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('=== JWT STRATEGY DEBUG ===');
    console.log('Payload completo recibido:', JSON.stringify(payload, null, 2));
    console.log('Payload.sub (userId):', payload.sub);
    console.log('Payload.email:', payload.email);
    console.log('Payload.rol:', payload.rol);
    
    try {
      // Validar que el payload tenga los campos necesarios
      if (!payload.sub || !payload.email) {
        console.error('❌ JWT Strategy - Payload inválido, faltan campos requeridos');
        console.error('payload.sub:', payload.sub);
        console.error('payload.email:', payload.email);
        throw new UnauthorizedException('Token inválido: payload incompleto');
      }
      
      console.log('✅ Payload válido, buscando usuario con ID:', payload.sub);
      
      const usuario = await this.authService.obtenerUsuarioPorId(payload.sub);
      if (!usuario) {
        console.error('❌ Usuario no encontrado en BD con ID:', payload.sub);
        throw new UnauthorizedException('Usuario no encontrado');
      }
      
      console.log('✅ Usuario encontrado en BD:', {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        activo: usuario.activo
      });
      
      // Verificar que el usuario esté activo
      if (!usuario.activo) {
        console.error('❌ Usuario inactivo:', payload.sub);
        throw new UnauthorizedException('Usuario inactivo');
      }
      
      const userObject = {
        userId: payload.sub,
        email: payload.email,
        rol: payload.rol || 'usuario',
        usuario: usuario,
      };
      
      console.log('✅ JWT Strategy - Usuario validado exitosamente:', {
        userId: userObject.userId,
        email: userObject.email,
        rol: userObject.rol
      });
      console.log('=== FIN JWT STRATEGY DEBUG ===');
      
      return userObject;
    } catch (error) {
      console.error('❌ Error en JWT Strategy validate:', error.message);
      console.error('Stack trace:', error.stack);
      throw new UnauthorizedException('Token inválido: ' + error.message);
    }
  }
}
