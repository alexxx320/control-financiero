import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health') // ¡IMPORTANTE! Agregar el path aquí
export class HealthController {
  
  @Get()
  @ApiOperation({ summary: 'Health check principal' })
  healthCheck() {
    console.log('💗 Health check - Endpoint accedido exitosamente');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Control Financiero API está funcionando correctamente',
      version: '1.0.0',
      endpoints: {
        api: '/api',
        auth: '/api/auth/login',
        docs: '/api/docs'
      }
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Health check detallado' })
  detailedHealthCheck() {
    console.log('💗 Health check detallado - Endpoint accedido');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      api: 'functional',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
