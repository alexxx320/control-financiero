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
exports.FondosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fondos_service_1 = require("./fondos.service");
const fondo_dto_1 = require("../../common/dto/fondo.dto");
const fondo_schema_1 = require("./schemas/fondo.schema");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let FondosController = class FondosController {
    constructor(fondosService) {
        this.fondosService = fondosService;
    }
    async create(createFondoDto, usuarioId) {
        console.log('FondosController - Crear fondo para usuario:', usuarioId);
        return await this.fondosService.create(createFondoDto, usuarioId);
    }
    async findAll(tipo, usuarioId) {
        console.log('FondosController - Obtener fondos para usuario:', usuarioId);
        if (tipo) {
            return await this.fondosService.findByTipo(tipo, usuarioId);
        }
        return await this.fondosService.findAll(usuarioId);
    }
    async getEstadisticas(usuarioId) {
        const totalFondos = await this.fondosService.getTotalFondos(usuarioId);
        const fondosConMetas = await this.fondosService.getFondosConMetas(usuarioId);
        return {
            totalFondos,
            fondosConMetas: fondosConMetas.length,
            metaPromedioAhorro: fondosConMetas.length > 0
                ? fondosConMetas.reduce((sum, f) => sum + f.metaAhorro, 0) / fondosConMetas.length
                : 0
        };
    }
    async findOne(id, usuarioId) {
        return await this.fondosService.findOne(id, usuarioId);
    }
    async update(id, updateFondoDto, usuarioId) {
        return await this.fondosService.update(id, updateFondoDto, usuarioId);
    }
    async remove(id, usuarioId) {
        console.log('🗑️ Backend - Eliminando COMPLETAMENTE fondo y transacciones:', { id, usuarioId });
        await this.fondosService.remove(id, usuarioId);
        const resultado = {
            message: 'Fondo y todas sus transacciones eliminados exitosamente de la base de datos'
        };
        console.log('✅ Backend - Eliminación COMPLETA exitosa:', resultado);
        return resultado;
    }
};
exports.FondosController = FondosController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo fondo' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Fondo creado exitosamente',
        type: fondo_schema_1.Fondo
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Datos inválidos o fondo ya existe'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fondo_dto_1.CreateFondoDto, String]),
    __metadata("design:returntype", Promise)
], FondosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos mis fondos activos' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de fondos obtenida exitosamente',
        type: [fondo_schema_1.Fondo]
    }),
    (0, swagger_1.ApiQuery)({
        name: 'tipo',
        required: false,
        description: 'Filtrar por tipo de fondo'
    }),
    __param(0, (0, common_1.Query)('tipo')),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FondosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de mis fondos' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estadísticas obtenidas exitosamente'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FondosController.prototype, "getEstadisticas", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un fondo por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del fondo' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fondo encontrado',
        type: fondo_schema_1.Fondo
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Fondo no encontrado'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FondosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un fondo' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del fondo' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fondo actualizado exitosamente',
        type: fondo_schema_1.Fondo
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Fondo no encontrado'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, fondo_dto_1.UpdateFondoDto, String]),
    __metadata("design:returntype", Promise)
], FondosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar un fondo COMPLETAMENTE (incluye todas las transacciones asociadas)',
        description: 'ATENCIÓN: Esta operación elimina permanentemente el fondo y TODAS sus transacciones asociadas de la base de datos. Esta acción NO se puede deshacer.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del fondo' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fondo y todas sus transacciones eliminados exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Fondo no encontrado'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FondosController.prototype, "remove", null);
exports.FondosController = FondosController = __decorate([
    (0, swagger_1.ApiTags)('fondos'),
    (0, common_1.Controller)('fondos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [fondos_service_1.FondosService])
], FondosController);
//# sourceMappingURL=fondos.controller.CORREGIDO.js.map