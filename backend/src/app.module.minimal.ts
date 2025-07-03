import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  constructor() {
    console.log('🏗️  AppModule inicializado correctamente');
    console.log('📋 Controladores registrados: AppController');
  }
}
