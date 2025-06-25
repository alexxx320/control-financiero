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
exports.TransaccionesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transacciones_service_1 = require("./transacciones.service");
const transaccion_dto_1 = require("../../common/dto/transaccion.dto");
const transaccion_schema_1 = require("./schemas/transaccion.schema");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
let TransaccionesController = class TransaccionesController {
    constructor(transaccionesService) {
        this.transaccionesService = transaccionesService;
    }
    async create(createTransaccionDto, usuarioId) {
        return await this.transaccionesService.create(createTransaccionDto, usuarioId);
    }
    async createTransferencia(createTransferenciaDto, usuarioId) {
        console.log('🔄 Backend - Endpoint transferencia llamado:', {
            url: '/api/transacciones/transferencia',
            body: createTransferenciaDto,
            usuarioId
        });
        try {
            const resultado = await this.transaccionesService.createTransferencia(createTransferenciaDto, usuarioId);
            console.log('✅ Backend - Transferencia creada exitosamente:', resultado);
            return resultado;
        }
        catch (error) {
            console.error('❌ Backend - Error en endpoint transferencia:', error);
            throw error;
        }
    }
    async findAll(filtros, usuarioId) {
        return await this.transaccionesService.findAll(usuarioId, filtros);
    }
    async getEstadisticasPorCategoria(fondoId) {
        return await this.transaccionesService.getEstadisticasPorCategoria(fondoId);
    }
    async getResumenMensual(año, mes, fondoId) {
        if (mes < 1 || mes > 12) {
            throw new common_1.BadRequestException('El mes debe estar entre 1 y 12');
        }
        return await this.transaccionesService.getResumenMensual(año, mes, fondoId);
    }
    async findByFondo(fondoId, filtros, usuarioId) {
        return await this.transaccionesService.findByFondo(fondoId, usuarioId, filtros);
    }
    async findOne(id, usuarioId) {
        return await this.transaccionesService.findOne(id, usuarioId);
    }
    async update(id, updateTransaccionDto, usuarioId) {
        console.log('🔄 Backend - Actualizando transacción:', { id, updateTransaccionDto, usuarioId });
        const resultado = await this.transaccionesService.update(id, updateTransaccionDto, usuarioId);
        console.log('✅ Backend - Transacción actualizada exitosamente:', resultado);
        return resultado;
    }
    async remove(id, usuarioId) {
        console.log('🗑️ Backend - Eliminando transacción:', { id, usuarioId });
        await this.transaccionesService.remove(id, usuarioId);
        const resultado = { message: 'Transacción eliminada exitosamente' };
        console.log('✅ Backend - Transacción eliminada exitosamente:', resultado);
        return resultado;
    }
};
exports.TransaccionesController = TransaccionesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva transacción' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Transacción creada exitosamente',
        type: transaccion_schema_1.Transaccion
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Datos inválidos'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaccion_dto_1.CreateTransaccionDto, String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('transferencia'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una transferencia entre fondos' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Transferencia creada exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Datos inválidos o saldo insuficiente'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaccion_dto_1.CreateTransferenciaDto, String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "createTransferencia", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas mis transacciones con filtros y paginación' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de transacciones obtenida exitosamente'
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaccion_dto_1.FiltroTransaccionesDto, String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('estadisticas/categorias'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas por categoría' }),
    (0, swagger_1.ApiQuery)({ name: 'fondoId', required: false, description: 'ID del fondo para filtrar' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estadísticas por categoría obtenidas exitosamente'
    }),
    __param(0, (0, common_1.Query)('fondoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "getEstadisticasPorCategoria", null);
__decorate([
    (0, common_1.Get)('resumen/:año/:mes'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener resumen mensual de transacciones' }),
    (0, swagger_1.ApiParam)({ name: 'año', description: 'Año para el resumen' }),
    (0, swagger_1.ApiParam)({ name: 'mes', description: 'Mes para el resumen (1-12)' }),
    (0, swagger_1.ApiQuery)({ name: 'fondoId', required: false, description: 'ID del fondo para filtrar' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Resumen mensual obtenido exitosamente'
    }),
    __param(0, (0, common_1.Param)('año', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('mes', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('fondoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "getResumenMensual", null);
__decorate([
    (0, common_1.Get)('fondo/:fondoId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener transacciones de un fondo específico' }),
    (0, swagger_1.ApiParam)({ name: 'fondoId', description: 'ID del fondo' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transacciones del fondo obtenidas exitosamente',
        type: [transaccion_schema_1.Transaccion]
    }),
    __param(0, (0, common_1.Param)('fondoId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaccion_dto_1.FiltroTransaccionesDto, String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "findByFondo", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una transacción por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la transacción' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transacción encontrada',
        type: transaccion_schema_1.Transaccion
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Transacción no encontrada'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una transacción' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la transacción' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transacción actualizada exitosamente',
        type: transaccion_schema_1.Transaccion
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Transacción no encontrada'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaccion_dto_1.UpdateTransaccionDto, String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una transacción' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la transacción' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transacción eliminada exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Transacción no encontrada'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "remove", null);
exports.TransaccionesController = TransaccionesController = __decorate([
    (0, swagger_1.ApiTags)('transacciones'),
    (0, common_1.Controller)('transacciones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [transacciones_service_1.TransaccionesService])
], TransaccionesController);
//# sourceMappingURL=transacciones.controller.js.map