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
exports.UpdateFondoDto = exports.CreateFondoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const financiero_interface_1 = require("../interfaces/financiero.interface");
class CreateFondoDto {
}
exports.CreateFondoDto = CreateFondoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nombre del fondo',
        example: 'Fondo de Emergencia'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFondoDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripción del fondo',
        example: 'Fondo para emergencias médicas y gastos inesperados'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFondoDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de fondo',
        enum: financiero_interface_1.TipoFondo,
        example: financiero_interface_1.TipoFondo.EMERGENCIA
    }),
    (0, class_validator_1.IsEnum)(financiero_interface_1.TipoFondo),
    __metadata("design:type", String)
], CreateFondoDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Saldo inicial del fondo (billetera)',
        example: 0,
        minimum: 0,
        default: 0
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFondoDto.prototype, "saldoActual", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Meta de ahorro para este fondo (opcional)',
        example: 10000,
        minimum: 0
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFondoDto.prototype, "metaAhorro", void 0);
class UpdateFondoDto {
}
exports.UpdateFondoDto = UpdateFondoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre del fondo',
        example: 'Fondo de Emergencia Actualizado'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFondoDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripción del fondo'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFondoDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo de fondo',
        enum: financiero_interface_1.TipoFondo
    }),
    (0, class_validator_1.IsEnum)(financiero_interface_1.TipoFondo),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFondoDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Meta de ahorro para este fondo',
        minimum: 0
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateFondoDto.prototype, "metaAhorro", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estado activo del fondo'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateFondoDto.prototype, "activo", void 0);
//# sourceMappingURL=fondo.dto.js.map