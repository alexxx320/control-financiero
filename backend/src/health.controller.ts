import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Controller()
@Public() // Marcar todo el controlador como público
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check - Verifica que la API esté funcionando' })
  healthCheck() {
    console.log('Health check - Endpoint accedido');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Control Financiero API está funcionando correctamente'
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check detallado' })
  detailedHealthCheck() {
    console.log('Health check detallado - Endpoint accedido');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'connected',
        auth: 'operational'
      }
    };
  }
}
