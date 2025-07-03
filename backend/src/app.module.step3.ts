import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AppController } from './app.controller';

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
  ],
  controllers: [AppController],
  providers: [
    // NO GUARD GLOBAL AÚN
  ],
})
export class AppModule {
  constructor() {
    console.log('🏗️  AppModule (con Auth, sin guard global) inicializado');
    console.log('📋 Controladores registrados: AppController');
  }
}
