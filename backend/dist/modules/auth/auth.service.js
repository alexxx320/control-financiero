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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const usuario_schema_1 = require("../usuarios/schemas/usuario.schema");
let AuthService = class AuthService {
    constructor(usuarioModel, jwtService) {
        this.usuarioModel = usuarioModel;
        this.jwtService = jwtService;
    }
    async registro(createUsuarioDto) {
        const usuarioExistente = await this.usuarioModel.findOne({
            email: createUsuarioDto.email.toLowerCase()
        });
        if (usuarioExistente) {
            throw new common_1.UnauthorizedException('El email ya está registrado');
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(createUsuarioDto.password, saltRounds);
        const nuevoUsuario = new this.usuarioModel({
            ...createUsuarioDto,
            email: createUsuarioDto.email.toLowerCase(),
            password: passwordHash,
            fechaRegistro: new Date(),
        });
        const usuarioGuardado = await nuevoUsuario.save();
        const payload = {
            sub: usuarioGuardado._id.toString(),
            email: usuarioGuardado.email,
            rol: usuarioGuardado.rol
        };
        const access_token = this.jwtService.sign(payload);
        await this.usuarioModel.findByIdAndUpdate(usuarioGuardado._id, {
            ultimoLogin: new Date()
        });
        return {
            access_token,
            usuario: {
                id: usuarioGuardado._id.toString(),
                email: usuarioGuardado.email,
                nombre: usuarioGuardado.nombre,
                apellido: usuarioGuardado.apellido,
                rol: usuarioGuardado.rol,
            },
            expires_in: 3600,
        };
    }
    async login(loginDto) {
        console.log('AuthService - Intentando login para:', loginDto.email);
        const usuario = await this.usuarioModel.findOne({
            email: loginDto.email.toLowerCase(),
            activo: true
        });
        if (!usuario) {
            console.error('Usuario no encontrado:', loginDto.email);
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const passwordValida = await bcrypt.compare(loginDto.password, usuario.password);
        if (!passwordValida) {
            console.error('Contraseña inválida para:', loginDto.email);
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        console.log('Login exitoso para usuario:', {
            id: usuario._id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol
        });
        const payload = {
            sub: usuario._id.toString(),
            email: usuario.email,
            rol: usuario.rol
        };
        console.log('Payload para JWT:', payload);
        const access_token = this.jwtService.sign(payload);
        console.log('Token generado (primeros 20 chars):', access_token.substring(0, 20));
        await this.usuarioModel.findByIdAndUpdate(usuario._id, {
            ultimoLogin: new Date()
        });
        const response = {
            access_token,
            usuario: {
                id: usuario._id.toString(),
                email: usuario.email,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                rol: usuario.rol,
            },
            expires_in: 3600,
        };
        console.log('Respuesta de login:', response);
        return response;
    }
    async validarUsuario(email, password) {
        const usuario = await this.usuarioModel.findOne({
            email: email.toLowerCase(),
            activo: true
        });
        if (usuario && await bcrypt.compare(password, usuario.password)) {
            const { password, ...resultado } = usuario.toObject();
            return resultado;
        }
        return null;
    }
    async obtenerUsuarioPorId(userId) {
        console.log('=== AUTH SERVICE DEBUG ===');
        console.log('Buscando usuario por ID:', userId);
        console.log('Tipo de userId:', typeof userId);
        console.log('Longitud de userId:', userId.length);
        try {
            const usuario = await this.usuarioModel
                .findById(userId)
                .select('-password')
                .exec();
            if (!usuario) {
                console.error('❌ Usuario no encontrado con ID:', userId);
                console.log('Verificando todos los usuarios en la BD...');
                const todosLosUsuarios = await this.usuarioModel
                    .find({})
                    .select('_id email nombre')
                    .limit(5)
                    .exec();
                console.log('Primeros 5 usuarios en BD:', todosLosUsuarios.map(u => ({
                    id: u._id.toString(),
                    email: u.email,
                    nombre: u.nombre
                })));
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            console.log('✅ Usuario encontrado en AuthService:', {
                id: usuario._id.toString(),
                email: usuario.email,
                nombre: usuario.nombre,
                activo: usuario.activo
            });
            console.log('=== FIN AUTH SERVICE DEBUG ===');
            return usuario;
        }
        catch (error) {
            console.error('❌ Error en obtenerUsuarioPorId:', error.message);
            throw error;
        }
    }
    async verificarToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const usuario = await this.obtenerUsuarioPorId(payload.sub);
            return usuario;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
    async cambiarPassword(userId, passwordActual, passwordNueva) {
        const usuario = await this.usuarioModel.findById(userId);
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
        if (!passwordValida) {
            throw new common_1.UnauthorizedException('Contraseña actual incorrecta');
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(passwordNueva, saltRounds);
        await this.usuarioModel.findByIdAndUpdate(userId, {
            password: passwordHash
        });
    }
    async obtenerUsuarioPorEmail(email) {
        const usuario = await this.usuarioModel
            .findOne({ email: email.toLowerCase() })
            .select('-password')
            .exec();
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        return usuario;
    }
    async renovarToken(userId) {
        const usuario = await this.obtenerUsuarioPorId(userId);
        const payload = {
            sub: usuario._id.toString(),
            email: usuario.email,
            rol: usuario.rol
        };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            usuario: {
                id: usuario._id.toString(),
                email: usuario.email,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                rol: usuario.rol,
            },
            expires_in: 3600,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(usuario_schema_1.Usuario.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map