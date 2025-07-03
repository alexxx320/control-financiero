import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  constructor() {
    console.log('🏗️  AppModule (con MongoDB) inicializado correctamente');
    console.log('📋 Controladores registrados: AppController');
  }
}
