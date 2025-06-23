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
exports.FiltroTransaccionesDto = exports.UpdateTransaccionDto = exports.CreateTransaccionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const financiero_interface_1 = require("../interfaces/financiero.interface");
class CreateTransaccionDto {
}
exports.CreateTransaccionDto = CreateTransaccionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del fondo al que pertenece la transacción',
        example: '507f1f77bcf86cd799439011'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "fondoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Descripción de la transacción',
        example: 'Compra de supermercado'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Monto de la transacción',
        example: 1500.50,
        minimum: 0.01
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateTransaccionDto.prototype, "monto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de transacción',
        enum: financiero_interface_1.TipoTransaccion,
        example: financiero_interface_1.TipoTransaccion.GASTO
    }),
    (0, class_validator_1.IsEnum)(financiero_interface_1.TipoTransaccion),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Categoría de la transacción',
        enum: financiero_interface_1.CategoriaTransaccion,
        example: financiero_interface_1.CategoriaTransaccion.NECESARIO
    }),
    (0, class_validator_1.IsEnum)(financiero_interface_1.CategoriaTransaccion),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notas adicionales sobre la transacción',
        example: 'Compra semanal en el supermercado'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "notas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Etiquetas para categorizar la transacción',
        example: ['supermercado', 'semanal'],
        type: [String]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTransaccionDto.prototype, "etiquetas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de la transacción',
        example: '2024-06-20T05:00:00.000Z',
        type: Date
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateTransaccionDto.prototype, "fecha", void 0);
class UpdateTransaccionDto {
}
exports.UpdateTransaccionDto = UpdateTransaccionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del fondo al que pertenece la transacción'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransaccionDto.prototype, "fondoId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripción de la transacción'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransaccionDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Monto de la transacción',
        minimum: 0.01
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateTransaccionDto.prototype, "monto", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo de transacción',
        enum: financiero_interface_1.TipoTransaccion
    }),
    (0, class_validator_1.IsEnum)(financiero_interface_1.TipoTransaccion),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransaccionDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Categoría de la transacción',
        enum: financiero_interface_1.CategoriaTransaccion
    }),
    (0, class_validator_1.IsEnum)(financiero_interface_1.CategoriaTransaccion),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransaccionDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Notas adicionales sobre la transacción'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransaccionDto.prototype, "notas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Etiquetas para categorizar la transacción',
        type: [String]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTransaccionDto.prototype, "etiquetas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de la transacción'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateTransaccionDto.prototype, "fecha", void 0);
class FiltroTransaccionesDto {
}
exports.FiltroTransaccionesDto = FiltroTransaccionesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del fondo para filtrar transacciones',
        example: '507f1f77bcf86cd799439011'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FiltroTransaccionesDto.prototype, "fondoId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tipo de transacción a filtrar',
        enum: financiero_interface_1.TipoTransaccion
    }),
    (0, class_validator_1.IsEnum)(financiero_interface_1.TipoTransaccion),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FiltroTransaccionesDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Categoría a filtrar',
        enum: financiero_interface_1.CategoriaTransaccion
    }),
    (0, class_validator_1.IsEnum)(financiero_interface_1.CategoriaTransaccion),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FiltroTransaccionesDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha específica (YYYY-MM-DD)',
        example: '2024-01-01'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FiltroTransaccionesDto.prototype, "fecha", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de inicio para el filtro (YYYY-MM-DD)',
        example: '2024-01-01'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FiltroTransaccionesDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fecha de fin para el filtro (YYYY-MM-DD)',
        example: '2024-12-31'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FiltroTransaccionesDto.prototype, "fechaFin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Monto mínimo',
        minimum: 0
    }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FiltroTransaccionesDto.prototype, "montoMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Monto máximo',
        minimum: 0
    }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FiltroTransaccionesDto.prototype, "montoMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Página para paginación',
        minimum: 1,
        default: 1
    }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FiltroTransaccionesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Límite de resultados por página',
        minimum: 1,
        maximum: 100,
        default: 10
    }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FiltroTransaccionesDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Página para paginación (alias)',
        minimum: 1,
        default: 1
    }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FiltroTransaccionesDto.prototype, "pagina", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Límite de resultados por página (alias)',
        minimum: 1,
        maximum: 100,
        default: 10
    }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FiltroTransaccionesDto.prototype, "limite", void 0);
//# sourceMappingURL=transaccion.dto.js.map