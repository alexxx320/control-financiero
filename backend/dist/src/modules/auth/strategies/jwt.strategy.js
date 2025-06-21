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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../auth.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, authService) {
        const jwtSecret = configService.get('JWT_SECRET', 'secreto-super-seguro-para-desarrollo');
        console.log('🔑 JWT Strategy inicializado con secret:', jwtSecret.substring(0, 10) + '...');
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
        this.configService = configService;
        this.authService = authService;
    }
    async validate(payload) {
        console.log('=== JWT STRATEGY DEBUG ===');
        console.log('Payload completo recibido:', JSON.stringify(payload, null, 2));
        console.log('Payload.sub (userId):', payload.sub);
        console.log('Payload.email:', payload.email);
        console.log('Payload.rol:', payload.rol);
        try {
            if (!payload.sub || !payload.email) {
                console.error('❌ JWT Strategy - Payload inválido, faltan campos requeridos');
                console.error('payload.sub:', payload.sub);
                console.error('payload.email:', payload.email);
                throw new common_1.UnauthorizedException('Token inválido: payload incompleto');
            }
            console.log('✅ Payload válido, buscando usuario con ID:', payload.sub);
            const usuario = await this.authService.obtenerUsuarioPorId(payload.sub);
            if (!usuario) {
                console.error('❌ Usuario no encontrado en BD con ID:', payload.sub);
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            console.log('✅ Usuario encontrado en BD:', {
                id: usuario._id,
                email: usuario.email,
                nombre: usuario.nombre,
                activo: usuario.activo
            });
            if (!usuario.activo) {
                console.error('❌ Usuario inactivo:', payload.sub);
                throw new common_1.UnauthorizedException('Usuario inactivo');
            }
            const userObject = {
                userId: payload.sub,
                email: payload.email,
                rol: payload.rol || 'usuario',
                usuario: usuario,
            };
            console.log('✅ JWT Strategy - Usuario validado exitosamente:', {
                userId: userObject.userId,
                email: userObject.email,
                rol: userObject.rol
            });
            console.log('=== FIN JWT STRATEGY DEBUG ===');
            return userObject;
        }
        catch (error) {
            console.error('❌ Error en JWT Strategy validate:', error.message);
            console.error('Stack trace:', error.stack);
            throw new common_1.UnauthorizedException('Token inválido: ' + error.message);
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map