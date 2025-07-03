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
exports.PrestamoSchema = exports.Prestamo = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const prestamo_dto_1 = require("../../../common/dto/prestamo.dto");
let Prestamo = class Prestamo {
};
exports.Prestamo = Prestamo;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: 'Usuario',
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Prestamo.prototype, "usuarioId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: 'Fondo',
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Prestamo.prototype, "fondoId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Prestamo.prototype, "nombreDeudor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Prestamo.prototype, "contacto", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0.01 }),
    __metadata("design:type", Number)
], Prestamo.prototype, "montoOriginal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Prestamo.prototype, "montoAbonado", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Prestamo.prototype, "fechaPrestamo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Prestamo.prototype, "fechaVencimiento", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Prestamo.prototype, "descripcion", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(prestamo_dto_1.EstadoPrestamo),
        default: prestamo_dto_1.EstadoPrestamo.ACTIVO
    }),
    __metadata("design:type", String)
], Prestamo.prototype, "estado", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Prestamo.prototype, "notas", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Prestamo.prototype, "activo", void 0);
exports.Prestamo = Prestamo = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Prestamo);
exports.PrestamoSchema = mongoose_1.SchemaFactory.createForClass(Prestamo);
exports.PrestamoSchema.index({ usuarioId: 1, fondoId: 1 });
exports.PrestamoSchema.index({ usuarioId: 1, estado: 1 });
exports.PrestamoSchema.index({ usuarioId: 1, fechaVencimiento: 1 });
exports.PrestamoSchema.index({ nombreDeudor: 1, usuarioId: 1 });
exports.PrestamoSchema.virtual('saldoPendiente').get(function () {
    return this.montoOriginal - this.montoAbonado;
});
exports.PrestamoSchema.virtual('porcentajePagado').get(function () {
    return (this.montoAbonado / this.montoOriginal) * 100;
});
exports.PrestamoSchema.set('toJSON', { virtuals: true });
exports.PrestamoSchema.set('toObject', { virtuals: true });
//# sourceMappingURL=prestamo.schema.js.map