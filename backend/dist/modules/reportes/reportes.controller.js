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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reportes_service_1 = require("./reportes.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let ReportesController = class ReportesController {
    constructor(reportesService) {
        this.reportesService = reportesService;
    }
    async generarReporteMensual(mes, año, usuarioId) {
        console.log(`📊 ReportesController - Generando reporte mensual para usuario: ${usuarioId}`);
        if (mes < 1 || mes > 12) {
            throw new common_1.BadRequestException('El mes debe estar entre 1 y 12');
        }
        return await this.reportesService.generarReporteMensual(mes, año, usuarioId);
    }
    async generarReporteAnual(año, usuarioId) {
        console.log(`📅 ReportesController - Generando reporte anual para usuario: ${usuarioId}`);
        return await this.reportesService.generarReporteAnual(año, usuarioId);
    }
    async obtenerAlertas(usuarioId) {
        console.log(`🚨 ReportesController - Obteniendo alertas para usuario: ${usuarioId}`);
        return await this.reportesService.obtenerAlertasFinancieras(usuarioId);
    }
    async obtenerEstadisticas(usuarioId) {
        console.log(`📈 ReportesController - Obteniendo estadísticas para usuario: ${usuarioId}`);
        return await this.reportesService.obtenerEstadisticasGenerales(usuarioId);
    }
};
exports.ReportesController = ReportesController;
__decorate([
    (0, common_1.Get)('mensual'),
    (0, swagger_1.ApiOperation)({ summary: 'Generar reporte mensual' }),
    (0, swagger_1.ApiQuery)({ name: 'mes', description: 'Mes (1-12)' }),
    (0, swagger_1.ApiQuery)({ name: 'año', description: 'Año' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reporte mensual generado exitosamente'
    }),
    __param(0, (0, common_1.Query)('mes', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('año', common_1.ParseIntPipe)),
    __param(2, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "generarReporteMensual", null);
__decorate([
    (0, common_1.Get)('anual'),
    (0, swagger_1.ApiOperation)({ summary: 'Generar reporte anual' }),
    (0, swagger_1.ApiQuery)({ name: 'año', description: 'Año para el reporte' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reporte anual generado exitosamente'
    }),
    __param(0, (0, common_1.Query)('año', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "generarReporteAnual", null);
__decorate([
    (0, common_1.Get)('alertas'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener alertas financieras' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Alertas obtenidas exitosamente'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "obtenerAlertas", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas generales del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estadísticas obtenidas exitosamente'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportesController.prototype, "obtenerEstadisticas", null);
exports.ReportesController = ReportesController = __decorate([
    (0, swagger_1.ApiTags)('reportes'),
    (0, common_1.Controller)('reportes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [reportes_service_1.ReportesService])
], ReportesController);
//# sourceMappingURL=reportes.controller.js.map