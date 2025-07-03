"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let HealthController = class HealthController {
    healthCheck() {
        console.log('💗 Health check - Endpoint accedido exitosamente');
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            message: 'Control Financiero API está funcionando correctamente',
            version: '1.0.0',
            endpoints: {
                api: '/api',
                auth: '/api/auth/login',
                docs: '/api/docs'
            }
        };
    }
    detailedHealthCheck() {
        console.log('💗 Health check detallado - Endpoint accedido');
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            api: 'functional',
            database: 'connected',
            environment: process.env.NODE_ENV || 'development'
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check principal' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('detailed'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check detallado' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "detailedHealthCheck", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health')
], HealthController);
//# sourceMappingURL=health.controller.fixed.js.map