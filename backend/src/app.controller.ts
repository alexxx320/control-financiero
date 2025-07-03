import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello(): string {
    console.log('🎯 AppController - Root endpoint accedido');
    return 'Control Financiero API funcionando correctamente';
  }

  @Public()
  @Get('health')
  getHealth() {
    console.log('🎯 AppController - Health endpoint accedido');
    return { 
      status: 'ok', 
      message: 'Backend funcionando',
      timestamp: new Date().toISOString() 
    };
  }
}
