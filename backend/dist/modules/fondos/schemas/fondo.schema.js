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
exports.FondoSchema = exports.Fondo = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const financiero_interface_1 = require("../../../common/interfaces/financiero.interface");
let Fondo = class Fondo {
};
exports.Fondo = Fondo;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: 'Usuario',
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Fondo.prototype, "usuarioId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Fondo.prototype, "nombre", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Fondo.prototype, "descripcion", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(financiero_interface_1.TipoFondo),
        default: financiero_interface_1.TipoFondo.PERSONAL
    }),
    __metadata("design:type", String)
], Fondo.prototype, "tipo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Fondo.prototype, "saldoActual", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, default: 0 }),
    __metadata("design:type", Number)
], Fondo.prototype, "metaAhorro", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Fondo.prototype, "fechaCreacion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Fondo.prototype, "activo", void 0);
exports.Fondo = Fondo = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Fondo);
exports.FondoSchema = mongoose_1.SchemaFactory.createForClass(Fondo);
exports.FondoSchema.index({ usuarioId: 1, nombre: 1 });
exports.FondoSchema.index({ usuarioId: 1, tipo: 1 });
exports.FondoSchema.index({ usuarioId: 1, activo: 1 });
//# sourceMappingURL=fondo.schema.js.map