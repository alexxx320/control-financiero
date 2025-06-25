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
exports.TransaccionSchema = exports.Transaccion = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const financiero_interface_1 = require("../../../common/interfaces/financiero.interface");
let Transaccion = class Transaccion {
};
exports.Transaccion = Transaccion;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: 'Usuario',
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaccion.prototype, "usuarioId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: 'Fondo',
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaccion.prototype, "fondoId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: false,
        type: mongoose_2.Types.ObjectId,
        ref: 'Fondo',
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Transaccion.prototype, "fondoDestinoId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Transaccion.prototype, "descripcion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0.01 }),
    __metadata("design:type", Number)
], Transaccion.prototype, "monto", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(financiero_interface_1.TipoTransaccion)
    }),
    __metadata("design:type", String)
], Transaccion.prototype, "tipo", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(financiero_interface_1.CategoriaTransaccion)
    }),
    __metadata("design:type", String)
], Transaccion.prototype, "categoria", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now, index: true }),
    __metadata("design:type", Date)
], Transaccion.prototype, "fecha", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Transaccion.prototype, "notas", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Transaccion.prototype, "etiquetas", void 0);
exports.Transaccion = Transaccion = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Transaccion);
exports.TransaccionSchema = mongoose_1.SchemaFactory.createForClass(Transaccion);
exports.TransaccionSchema.index({ usuarioId: 1, fecha: -1 });
exports.TransaccionSchema.index({ fondoId: 1, fecha: -1 });
exports.TransaccionSchema.index({ usuarioId: 1, tipo: 1 });
exports.TransaccionSchema.index({ usuarioId: 1, categoria: 1 });
exports.TransaccionSchema.index({ fecha: -1 });
exports.TransaccionSchema.index({ monto: 1 });
//# sourceMappingURL=transaccion.schema.js.map