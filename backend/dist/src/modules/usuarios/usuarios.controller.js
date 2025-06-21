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
exports.UsuariosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const usuarios_service_1 = require("./usuarios.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
const usuario_dto_1 = require("../../common/dto/usuario.dto");
const usuario_schema_1 = require("./schemas/usuario.schema");
let UsuariosController = class UsuariosController {
    constructor(usuariosService) {
        this.usuariosService = usuariosService;
    }
    async findAll() {
        return await this.usuariosService.findAll();
    }
    async buscarUsuarios(termino) {
        return await this.usuariosService.buscarUsuarios(termino);
    }
    async obtenerEstadisticas() {
        return await this.usuariosService.obtenerEstadisticas();
    }
    async obtenerMiPerfil(userId) {
        return await this.usuariosService.findOne(userId);
    }
    async actualizarMiPerfil(userId, updateUsuarioDto) {
        return await this.usuariosService.update(userId, updateUsuarioDto);
    }
    async actualizarMisPreferencias(userId, preferencias) {
        return await this.usuariosService.updatePreferencias(userId, preferencias);
    }
    async actualizarMiAvatar(userId, avatarUrl) {
        return await this.usuariosService.updateAvatar(userId, avatarUrl);
    }
    async findOne(id) {
        return await this.usuariosService.findOne(id);
    }
    async update(id, updateUsuarioDto) {
        return await this.usuariosService.update(id, updateUsuarioDto);
    }
    async cambiarRol(id, nuevoRol) {
        return await this.usuariosService.cambiarRol(id, nuevoRol);
    }
    async remove(id) {
        await this.usuariosService.remove(id);
        return { message: 'Usuario eliminado exitosamente' };
    }
};
exports.UsuariosController = UsuariosController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(usuario_schema_1.RolUsuario.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los usuarios (solo admin)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de usuarios obtenida exitosamente',
        type: [usuario_schema_1.Usuario]
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Acceso denegado - se requiere rol admin'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('buscar'),
    (0, roles_decorator_1.Roles)(usuario_schema_1.RolUsuario.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar usuarios por término (solo admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'q', description: 'Término de búsqueda' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Resultados de búsqueda obtenidos exitosamente'
    }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "buscarUsuarios", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    (0, roles_decorator_1.Roles)(usuario_schema_1.RolUsuario.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de usuarios (solo admin)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estadísticas obtenidas exitosamente'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "obtenerEstadisticas", null);
__decorate([
    (0, common_1.Get)('mi-perfil'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mi perfil de usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Perfil obtenido exitosamente',
        type: usuario_schema_1.Usuario
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "obtenerMiPerfil", null);
__decorate([
    (0, common_1.Patch)('mi-perfil'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar mi perfil de usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Perfil actualizado exitosamente',
        type: usuario_schema_1.Usuario
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, usuario_dto_1.UpdateUsuarioDto]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "actualizarMiPerfil", null);
__decorate([
    (0, common_1.Patch)('mi-perfil/preferencias'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar mis preferencias' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Preferencias actualizadas exitosamente'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "actualizarMisPreferencias", null);
__decorate([
    (0, common_1.Patch)('mi-perfil/avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar mi avatar' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Avatar actualizado exitosamente'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __param(1, (0, common_1.Body)('avatarUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "actualizarMiAvatar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(usuario_schema_1.RolUsuario.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener usuario por ID (solo admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario encontrado',
        type: usuario_schema_1.Usuario
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(usuario_schema_1.RolUsuario.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar usuario por ID (solo admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario actualizado exitosamente',
        type: usuario_schema_1.Usuario
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, usuario_dto_1.UpdateUsuarioDto]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/rol'),
    (0, roles_decorator_1.Roles)(usuario_schema_1.RolUsuario.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar rol de usuario (solo admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rol cambiado exitosamente'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('rol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "cambiarRol", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(usuario_schema_1.RolUsuario.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar usuario (solo admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario eliminado exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "remove", null);
exports.UsuariosController = UsuariosController = __decorate([
    (0, swagger_1.ApiTags)('usuarios'),
    (0, common_1.Controller)('usuarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [usuarios_service_1.UsuariosService])
], UsuariosController);
//# sourceMappingURL=usuarios.controller.js.map