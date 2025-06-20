import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const IS_PUBLIC_KEY = 'isPublic';
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('JwtAuthGuard - Ruta:', context.getHandler().name, 'Es pública:', isPublic);
    
    if (isPublic) {
      console.log('JwtAuthGuard - Ruta pública, permitiendo acceso');
      return true;
    }
    
    console.log('JwtAuthGuard - Ruta protegida, verificando token...');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('JwtAuthGuard - handleRequest:', {
      error: err?.message,
      user: user ? { id: user.userId, email: user.email } : null,
      info: info?.message
    });
    
    if (err || !user) {
      console.error('JwtAuthGuard - Usuario no autorizado:', err?.message || info?.message);
      throw err || new UnauthorizedException('Token inválido o usuario no encontrado');
    }
    
    console.log('JwtAuthGuard - Usuario autorizado:', user.email);
    return user;
  }
}
