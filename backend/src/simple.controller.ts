import { Controller, Get } from '@nestjs/common';

@Controller()
export class SimpleController {
  
  @Get('test')
  test() {
    console.log('🧪 Test endpoint accedido - SIN GUARD');
    return {
      message: 'Test endpoint funcionando',
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  health() {
    console.log('💗 Health endpoint accedido - SIN GUARD');
    return {
      status: 'ok',
      message: 'Health check funcionando',
      timestamp: new Date().toISOString()
    };
  }
}
