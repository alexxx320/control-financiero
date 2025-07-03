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
exports.PrestamosController = void 0;
const common_1 = require("@nestjs/common");
const prestamos_service_1 = require("./prestamos.service");
const prestamo_dto_1 = require("../../common/dto/prestamo.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PrestamosController = class PrestamosController {
    constructor(prestamosService) {
        this.prestamosService = prestamosService;
    }
    async create(createPrestamoDto, req) {
        return this.prestamosService.create(createPrestamoDto, req.user.sub);
    }
    async findAll(req, fondoId) {
        return this.prestamosService.findAll(req.user.sub, fondoId);
    }
    async obtenerEstadisticas(req, fondoId) {
        return this.prestamosService.obtenerEstadisticas(req.user.sub, fondoId);
    }
    async obtenerResumenDeudores(req, fondoId) {
        return this.prestamosService.obtenerResumenPorDeudor(req.user.sub, fondoId);
    }
    async findOne(id, req) {
        return this.prestamosService.findOne(id, req.user.sub);
    }
    async update(id, updatePrestamoDto, req) {
        return this.prestamosService.update(id, updatePrestamoDto, req.user.sub);
    }
    async remove(id, req) {
        return this.prestamosService.remove(id, req.user.sub);
    }
    async registrarPago(prestamoId, createPagoDto, req) {
        createPagoDto.prestamoId = prestamoId;
        return this.prestamosService.registrarPago(createPagoDto, req.user.sub);
    }
    async obtenerPagos(prestamoId, req) {
        return this.prestamosService.obtenerPagosPrestamo(prestamoId, req.user.sub);
    }
    async actualizarVencidos() {
        return this.prestamosService.actualizarEstadosVencidos();
    }
};
exports.PrestamosController = PrestamosController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [prestamo_dto_1.CreatePrestamoDto, Object]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('fondoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('fondoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "obtenerEstadisticas", null);
__decorate([
    (0, common_1.Get)('resumen-deudores'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('fondoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "obtenerResumenDeudores", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, prestamo_dto_1.UpdatePrestamoDto, Object]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/pagos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, prestamo_dto_1.CreatePagoPrestamoDto, Object]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "registrarPago", null);
__decorate([
    (0, common_1.Get)(':id/pagos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "obtenerPagos", null);
__decorate([
    (0, common_1.Post)('actualizar-vencidos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrestamosController.prototype, "actualizarVencidos", null);
exports.PrestamosController = PrestamosController = __decorate([
    (0, common_1.Controller)('prestamos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prestamos_service_1.PrestamosService])
], PrestamosController);
//# sourceMappingURL=prestamos.controller.js.map