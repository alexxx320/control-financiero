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
exports.UserSessionSchema = exports.UserSession = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UserSession = class UserSession {
};
exports.UserSession = UserSession;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'Usuario' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], UserSession.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserSession.prototype, "deviceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserSession.prototype, "deviceName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserSession.prototype, "deviceFingerprint", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserSession.prototype, "userAgent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], UserSession.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], UserSession.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], UserSession.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Date)
], UserSession.prototype, "lastActivity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], UserSession.prototype, "isActive", void 0);
exports.UserSession = UserSession = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UserSession);
exports.UserSessionSchema = mongoose_1.SchemaFactory.createForClass(UserSession);
exports.UserSessionSchema.index({ userId: 1, isActive: 1 });
exports.UserSessionSchema.index({ deviceId: 1 });
exports.UserSessionSchema.index({ userId: 1, deviceId: 1 });
//# sourceMappingURL=user-session.schema.js.map