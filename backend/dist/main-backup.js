"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: [
            'http://localhost:4200',
            'http://localhost:3000',
            'https://hearty-intuition-production.up.railway.app',
            'https://control-financiero.up.railway.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Device-ID', 'X-CSRF-Token'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Control Financiero API')
        .setDescription('API para el sistema de control financiero personal con autenticación JWT avanzada')
        .setVersion('1.0')
        .addTag('auth', 'Autenticación y autorización con JWT')
        .addTag('fondos', 'Gestión de fondos financieros')
        .addTag('transacciones', 'Gestión de transacciones')
        .addTag('reportes', 'Generación de reportes')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
    console.log(`📚 Documentación API: http://localhost:${port}/api/docs`);
    console.log(`🔒 Sistema JWT implementado con access/refresh tokens`);
    console.log(`⚠️  NOTA: Instala cookie-parser, helmet y express-rate-limit para seguridad completa`);
}
bootstrap();
//# sourceMappingURL=main-backup.js.map