import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

export const DeviceInfoDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    
    // Obtener información del dispositivo
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const xForwardedFor = request.headers['x-forwarded-for'];
    const ipAddress = (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor?.split(',')[0]) || 
                      request.connection.remoteAddress || 
                      request.ip || 
                      'Unknown';

    // Generar o extraer device ID
    let deviceId = request.headers['x-device-id'] as string;
    if (!deviceId) {
      // Generar device ID basado en características del dispositivo
      deviceId = crypto
        .createHash('sha256')
        .update(userAgent + ipAddress + (request.headers['accept-language'] || ''))
        .digest('hex')
        .substring(0, 32);
    }

    // Crear fingerprint del dispositivo
    const fingerprint = crypto
      .createHash('sha256')
      .update([
        userAgent,
        request.headers['accept-language'],
        request.headers['accept-encoding'],
        request.headers['accept'],
        ipAddress
      ].join('|'))
      .digest('hex');

    return {
      deviceId,
      fingerprint,
      userAgent,
      ipAddress: ipAddress.replace('::ffff:', ''), // Limpiar IPv6 wrapper
      location: request.headers['cf-ipcountry'] || undefined // Cloudflare country header
    };
  },
);
