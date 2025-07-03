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
exports.CreatePagoPrestamoDto = exports.UpdatePrestamoDto = exports.CreatePrestamoDto = exports.TipoPago = exports.EstadoPrestamo = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var EstadoPrestamo;
(function (EstadoPrestamo) {
    EstadoPrestamo["ACTIVO"] = "activo";
    EstadoPrestamo["PAGADO"] = "pagado";
    EstadoPrestamo["VENCIDO"] = "vencido";
    EstadoPrestamo["PARCIAL"] = "parcial";
})(EstadoPrestamo || (exports.EstadoPrestamo = EstadoPrestamo = {}));
var TipoPago;
(function (TipoPago) {
    TipoPago["ABONO"] = "abono";
    TipoPago["PAGO_TOTAL"] = "pago_total";
})(TipoPago || (exports.TipoPago = TipoPago = {}));
class CreatePrestamoDto {
}
exports.CreatePrestamoDto = CreatePrestamoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePrestamoDto.prototype, "fondoId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePrestamoDto.prototype, "nombreDeudor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePrestamoDto.prototype, "contacto", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePrestamoDto.prototype, "montoOriginal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreatePrestamoDto.prototype, "fechaPrestamo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreatePrestamoDto.prototype, "fechaVencimiento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePrestamoDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePrestamoDto.prototype, "notas", void 0);
class UpdatePrestamoDto {
}
exports.UpdatePrestamoDto = UpdatePrestamoDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePrestamoDto.prototype, "nombreDeudor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePrestamoDto.prototype, "contacto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], UpdatePrestamoDto.prototype, "fechaVencimiento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePrestamoDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(EstadoPrestamo),
    __metadata("design:type", String)
], UpdatePrestamoDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePrestamoDto.prototype, "notas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePrestamoDto.prototype, "activo", void 0);
class CreatePagoPrestamoDto {
}
exports.CreatePagoPrestamoDto = CreatePagoPrestamoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePagoPrestamoDto.prototype, "prestamoId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePagoPrestamoDto.prototype, "monto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreatePagoPrestamoDto.prototype, "fechaPago", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TipoPago),
    __metadata("design:type", String)
], CreatePagoPrestamoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePagoPrestamoDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePagoPrestamoDto.prototype, "notas", void 0);
//# sourceMappingURL=prestamo.dto.js.map