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
exports.AuthResponseDto = exports.CambiarPasswordDto = exports.UpdateUsuarioDto = exports.LoginDto = exports.CreateUsuarioDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const usuario_schema_1 = require("../../modules/usuarios/schemas/usuario.schema");
class CreateUsuarioDto {
}
exports.CreateUsuarioDto = CreateUsuarioDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email del usuario',
        example: 'usuario@ejemplo.com'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email debe tener un formato válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email es requerido' }),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre del usuario',
        example: 'Juan'
    }),
    (0, class_validator_1.IsString)({ message: 'Nombre debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nombre es requerido' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Nombre no puede exceder 50 caracteres' }),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Apellido del usuario',
        example: 'Pérez'
    }),
    (0, class_validator_1.IsString)({ message: 'Apellido debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Apellido es requerido' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Apellido no puede exceder 50 caracteres' }),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "apellido", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contraseña del usuario',
        example: 'MiContraseña123!',
        minLength: 8
    }),
    (0, class_validator_1.IsString)({ message: 'Contraseña debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Contraseña es requerida' }),
    (0, class_validator_1.MinLength)(8, { message: 'Contraseña debe tener al menos 8 caracteres' }),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Teléfono del usuario',
        example: '+57 300 123 4567'
    }),
    (0, class_validator_1.IsString)({ message: 'Teléfono debe ser una cadena de texto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "telefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rol del usuario',
        enum: usuario_schema_1.RolUsuario,
        default: usuario_schema_1.RolUsuario.USUARIO
    }),
    (0, class_validator_1.IsEnum)(usuario_schema_1.RolUsuario, { message: 'Rol debe ser admin o usuario' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "rol", void 0);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email del usuario',
        example: 'usuario@ejemplo.com'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email debe tener un formato válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email es requerido' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contraseña del usuario',
        example: 'MiContraseña123!'
    }),
    (0, class_validator_1.IsString)({ message: 'Contraseña debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Contraseña es requerida' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class UpdateUsuarioDto {
}
exports.UpdateUsuarioDto = UpdateUsuarioDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre del usuario'
    }),
    (0, class_validator_1.IsString)({ message: 'Nombre debe ser una cadena de texto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50, { message: 'Nombre no puede exceder 50 caracteres' }),
    __metadata("design:type", String)
], UpdateUsuarioDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Apellido del usuario'
    }),
    (0, class_validator_1.IsString)({ message: 'Apellido debe ser una cadena de texto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50, { message: 'Apellido no puede exceder 50 caracteres' }),
    __metadata("design:type", String)
], UpdateUsuarioDto.prototype, "apellido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Teléfono del usuario'
    }),
    (0, class_validator_1.IsString)({ message: 'Teléfono debe ser una cadena de texto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUsuarioDto.prototype, "telefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL del avatar del usuario'
    }),
    (0, class_validator_1.IsString)({ message: 'Avatar debe ser una cadena de texto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUsuarioDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferencias del usuario'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateUsuarioDto.prototype, "preferencias", void 0);
class CambiarPasswordDto {
}
exports.CambiarPasswordDto = CambiarPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contraseña actual',
        example: 'MiContraseñaVieja123!'
    }),
    (0, class_validator_1.IsString)({ message: 'Contraseña actual debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Contraseña actual es requerida' }),
    __metadata("design:type", String)
], CambiarPasswordDto.prototype, "passwordActual", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nueva contraseña',
        example: 'MiContraseñaNueva123!',
        minLength: 8
    }),
    (0, class_validator_1.IsString)({ message: 'Nueva contraseña debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nueva contraseña es requerida' }),
    (0, class_validator_1.MinLength)(8, { message: 'Nueva contraseña debe tener al menos 8 caracteres' }),
    __metadata("design:type", String)
], CambiarPasswordDto.prototype, "passwordNueva", void 0);
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token de acceso JWT',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "access_token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Información del usuario',
        type: Object
    }),
    __metadata("design:type", Object)
], AuthResponseDto.prototype, "usuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tiempo de expiración del token en segundos',
        example: 3600
    }),
    __metadata("design:type", Number)
], AuthResponseDto.prototype, "expires_in", void 0);
//# sourceMappingURL=usuario.dto.js.map