"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const core_1 = require("@nestjs/core");
const fondos_module_1 = require("./modules/fondos/fondos.module");
const transacciones_module_1 = require("./modules/transacciones/transacciones.module");
const reportes_module_1 = require("./modules/reportes/reportes.module");
const auth_module_1 = require("./modules/auth/auth.module");
const usuarios_module_1 = require("./modules/usuarios/usuarios.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const health_controller_1 = require("./health.controller");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get('MONGODB_URI', 'mongodb://localhost:27017/control-financiero'),
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            usuarios_module_1.UsuariosModule,
            fondos_module_1.FondosModule,
            transacciones_module_1.TransaccionesModule,
            reportes_module_1.ReportesModule,
        ],
        controllers: [health_controller_1.HealthController, app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map