"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_minimal_1 = require("./app.module.minimal");
async function bootstrap() {
    console.log('🚀 Iniciando aplicación NestJS...');
    const app = await core_1.NestFactory.create(app_module_minimal_1.AppModule);
    console.log('✅ Aplicación creada exitosamente');
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    });
    console.log('✅ CORS configurado');
    app.setGlobalPrefix('api');
    console.log('✅ Prefijo API configurado');
    const port = 3000;
    await app.listen(port);
    console.log('🎉 ===================================');
    console.log(`🎉 Servidor MINIMO ejecutándose en: http://localhost:${port}`);
    console.log(`🎯 Root: http://localhost:${port}/api/`);
    console.log(`💗 Health: http://localhost:${port}/api/health`);
    console.log(`🧪 Test: http://localhost:${port}/api/test`);
    console.log('🎉 ===================================');
}
bootstrap().catch(err => {
    console.error('💥 Error al iniciar la aplicación:', err);
});
//# sourceMappingURL=main.minimal.js.map