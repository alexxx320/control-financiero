import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar prefijo global para todas las rutas
  app.setGlobalPrefix('api');
  
  // NOTA: Dependencias de seguridad comentadas temporalmente
  // Descomentar después de instalar: cookie-parser, helmet, express-rate-limit
  
  // // Configuración de seguridad
  // app.use(helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       styleSrc: ["'self'", "'unsafe-inline'"],
  //       scriptSrc: ["'self'"],
  //       imgSrc: ["'self'", "data:", "https:"],
  //     },
  //   },
  //   crossOriginEmbedderPolicy: false, // Para desarrollo
  // }));
  
  // // Configurar cookies
  // app.use(cookieParser(process.env.COOKIE_SECRET));
  
  // // Rate limiting para login
  // app.use('/api/auth/login', rateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 minutos
  //   max: 5, // 5 intentos por IP
  //   message: { message: 'Demasiados intentos de login' }
  // }));
  
  // // Rate limiting general para auth
  // app.use('/api/auth', rateLimit({
  //   windowMs: 1 * 60 * 1000, // 1 minuto
  //   max: 20, // 20 requests por minuto
  //   message: { message: 'Demasiadas solicitudes de autenticación' }
  // }));

  // Configurar CORS
  app.enableCors({
    origin: [
      'http://localhost:4200', 
      'http://localhost:3000',
      'https://hearty-intuition-production.up.railway.app',
      'https://control-financiero.up.railway.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true, // IMPORTANTE para cookies
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Device-ID', 'X-CSRF-Token'],
  });

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Cambiar a false para permitir campos adicionales
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Control Financiero API')
    .setDescription('API para el sistema de control financiero personal con autenticación JWT avanzada')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y autorización con JWT')
    .addTag('fondos', 'Gestión de fondos financieros')
    .addTag('transacciones', 'Gestión de transacciones')
    .addTag('reportes', 'Generación de reportes')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación API: http://localhost:${port}/api/docs`);
  console.log(`🔒 Sistema JWT implementado con access/refresh tokens`);
  console.log(`⚠️  NOTA: Instala cookie-parser, helmet y express-rate-limit para seguridad completa`);
}

bootstrap();
