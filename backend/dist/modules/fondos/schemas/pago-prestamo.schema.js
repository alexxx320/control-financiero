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
exports.PagoPrestamoSchema = exports.PagoPrestamo = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const prestamo_dto_1 = require("../../../common/dto/prestamo.dto");
let PagoPrestamo = class PagoPrestamo {
};
exports.PagoPrestamo = PagoPrestamo;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: 'Usuario',
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PagoPrestamo.prototype, "usuarioId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: 'Prestamo',
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PagoPrestamo.prototype, "prestamoId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: 'Fondo',
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PagoPrestamo.prototype, "fondoId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0.01 }),
    __metadata("design:type", Number)
], PagoPrestamo.prototype, "monto", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], PagoPrestamo.prototype, "fechaPago", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(prestamo_dto_1.TipoPago),
        default: prestamo_dto_1.TipoPago.ABONO
    }),
    __metadata("design:type", String)
], PagoPrestamo.prototype, "tipo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], PagoPrestamo.prototype, "descripcion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], PagoPrestamo.prototype, "notas", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PagoPrestamo.prototype, "activo", void 0);
exports.PagoPrestamo = PagoPrestamo = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PagoPrestamo);
exports.PagoPrestamoSchema = mongoose_1.SchemaFactory.createForClass(PagoPrestamo);
exports.PagoPrestamoSchema.index({ usuarioId: 1, prestamoId: 1 });
exports.PagoPrestamoSchema.index({ usuarioId: 1, fechaPago: 1 });
exports.PagoPrestamoSchema.index({ prestamoId: 1, fechaPago: -1 });
//# sourceMappingURL=pago-prestamo.schema.js.map