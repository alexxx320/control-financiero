import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { FondosModule } from './modules/fondos/fondos.module';
import { TransaccionesModule } from './modules/transacciones/transacciones.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { HealthController } from './health.controller';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/control-financiero');
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        
        console.log('🔧 MongoDB Configuration:');
        console.log('NODE_ENV:', nodeEnv);
        console.log('MONGODB_URI (first 30 chars):', mongoUri.substring(0, 30) + '...');
        console.log('Is Atlas URI?:', mongoUri.includes('mongodb+srv'));
        
        return {
          uri: mongoUri,
          retryWrites: true,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsuariosModule,
    FondosModule,
    TransaccionesModule,
    ReportesModule,
  ],
  controllers: [HealthController, AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
