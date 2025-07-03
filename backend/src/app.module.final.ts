import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { FondosModule } from './modules/fondos/fondos.module';
import { TransaccionesModule } from './modules/transacciones/transacciones.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { HealthController } from './health.controller.fixed';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/control-financiero'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsuariosModule,
    FondosModule,
    TransaccionesModule,
    ReportesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log('🏗️  AppModule COMPLETO inicializado correctamente');
    console.log('📋 Controladores: AppController, HealthController');
    console.log('🛡️  Guard global JWT activado');
  }
}
