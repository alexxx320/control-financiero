import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  constructor() {
    console.log('🏗️  AppModule (versión extendida) inicializado correctamente');
    console.log('📋 Controladores registrados: AppController');
  }
}
