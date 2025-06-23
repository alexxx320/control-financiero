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
exports.UsuarioSchema = exports.Usuario = exports.RolUsuario = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var RolUsuario;
(function (RolUsuario) {
    RolUsuario["ADMIN"] = "admin";
    RolUsuario["USUARIO"] = "usuario";
})(RolUsuario || (exports.RolUsuario = RolUsuario = {}));
let Usuario = class Usuario {
};
exports.Usuario = Usuario;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    }),
    __metadata("design:type", String)
], Usuario.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true
    }),
    __metadata("design:type", String)
], Usuario.prototype, "nombre", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true
    }),
    __metadata("design:type", String)
], Usuario.prototype, "apellido", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true
    }),
    __metadata("design:type", String)
], Usuario.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: Object.values(RolUsuario),
        default: RolUsuario.USUARIO
    }),
    __metadata("design:type", String)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: true
    }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "activo", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: Date.now
    }),
    __metadata("design:type", Date)
], Usuario.prototype, "fechaRegistro", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Usuario.prototype, "ultimoLogin", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        trim: true
    }),
    __metadata("design:type", String)
], Usuario.prototype, "telefono", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        trim: true
    }),
    __metadata("design:type", String)
], Usuario.prototype, "avatar", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: {
            monedaPrincipal: 'COP',
            formatoFecha: 'DD/MM/YYYY',
            notificacionesEmail: true,
            notificacionesAlertas: true,
        }
    }),
    __metadata("design:type", Object)
], Usuario.prototype, "preferencias", void 0);
exports.Usuario = Usuario = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Usuario);
exports.UsuarioSchema = mongoose_1.SchemaFactory.createForClass(Usuario);
exports.UsuarioSchema.index({ email: 1 });
exports.UsuarioSchema.index({ activo: 1 });
exports.UsuarioSchema.index({ fechaRegistro: -1 });
//# sourceMappingURL=usuario.schema.js.map