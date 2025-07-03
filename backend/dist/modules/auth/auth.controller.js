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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
const usuario_dto_1 = require("../../common/dto/usuario.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    testAuth() {
        console.log('🔐 AuthController - Test endpoint accedido');
        return {
            message: 'AuthController funcionando correctamente',
            timestamp: new Date().toISOString(),
            endpoints: {
                login: 'POST /api/auth/login',
                registro: 'POST /api/auth/registro',
                perfil: 'GET /api/auth/perfil'
            }
        };
    }
    async registro(createUsuarioDto) {
        return await this.authService.registro(createUsuarioDto);
    }
    async login(loginDto) {
        return await this.authService.login(loginDto);
    }
    async obtenerPerfil(user) {
        console.log('Usuario completo del token:', user);
        return {
            id: user.userId,
            email: user.email,
            nombre: user.usuario.nombre,
            apellido: user.usuario.apellido,
            rol: user.rol,
            telefono: user.usuario.telefono,
            avatar: user.usuario.avatar,
            preferencias: user.usuario.preferencias,
            fechaRegistro: user.usuario.fechaRegistro,
            ultimoLogin: user.usuario.ultimoLogin,
        };
    }
    async renovarToken(userId) {
        return await this.authService.renovarToken(userId);
    }
    async cambiarPassword(userId, cambiarPasswordDto) {
        await this.authService.cambiarPassword(userId, cambiarPasswordDto.passwordActual, cambiarPasswordDto.passwordNueva);
        return { message: 'Contraseña cambiada exitosamente' };
    }
    async logout() {
        return { message: 'Sesión cerrada exitosamente' };
    }
    async verificarEmail(email) {
        try {
            await this.authService.obtenerUsuarioPorEmail(email);
            return { disponible: false };
        }
        catch (error) {
            return { disponible: true };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('test'),
    (0, swagger_1.ApiOperation)({ summary: 'Test endpoint para verificar que auth funciona' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "testAuth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('registro'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nuevo usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuario registrado exitosamente',
        type: usuario_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Datos inválidos o email ya existe'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usuario_dto_1.CreateUsuarioDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registro", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar sesión' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login exitoso',
        type: usuario_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Credenciales inválidas'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usuario_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('perfil'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener perfil del usuario autenticado' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Perfil obtenido exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'No autenticado'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "obtenerPerfil", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('renovar-token'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Renovar token de acceso' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token renovado exitosamente',
        type: usuario_dto_1.AuthResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Token inválido'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "renovarToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('cambiar-password'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar contraseña del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Contraseña cambiada exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Contraseña actual incorrecta'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, usuario_dto_1.CambiarPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "cambiarPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar sesión' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sesión cerrada exitosamente'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verificar-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar si un email está disponible' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Verificación completada'
    }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verificarEmail", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map