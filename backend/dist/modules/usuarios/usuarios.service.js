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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const usuario_schema_1 = require("./schemas/usuario.schema");
let UsuariosService = class UsuariosService {
    constructor(usuarioModel) {
        this.usuarioModel = usuarioModel;
    }
    async findAll() {
        return await this.usuarioModel
            .find({ activo: true })
            .select('-password')
            .sort({ fechaRegistro: -1 })
            .exec();
    }
    async findOne(id) {
        const usuario = await this.usuarioModel
            .findById(id)
            .select('-password')
            .exec();
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado`);
        }
        return usuario;
    }
    async update(id, updateUsuarioDto) {
        const usuario = await this.usuarioModel
            .findByIdAndUpdate(id, updateUsuarioDto, { new: true })
            .select('-password')
            .exec();
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado`);
        }
        return usuario;
    }
    async remove(id) {
        const usuario = await this.findOne(id);
        await this.usuarioModel
            .findByIdAndUpdate(id, { activo: false })
            .exec();
    }
    async findByEmail(email) {
        const usuario = await this.usuarioModel
            .findOne({ email: email.toLowerCase(), activo: true })
            .select('-password')
            .exec();
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con email "${email}" no encontrado`);
        }
        return usuario;
    }
    async updatePreferencias(id, preferencias) {
        const usuario = await this.usuarioModel
            .findByIdAndUpdate(id, { $set: { preferencias } }, { new: true })
            .select('-password')
            .exec();
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado`);
        }
        return usuario;
    }
    async updateAvatar(id, avatarUrl) {
        const usuario = await this.usuarioModel
            .findByIdAndUpdate(id, { avatar: avatarUrl }, { new: true })
            .select('-password')
            .exec();
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado`);
        }
        return usuario;
    }
    async cambiarRol(id, nuevoRol) {
        const usuario = await this.usuarioModel
            .findByIdAndUpdate(id, { rol: nuevoRol }, { new: true })
            .select('-password')
            .exec();
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario con ID "${id}" no encontrado`);
        }
        return usuario;
    }
    async obtenerEstadisticas() {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        const [totalUsuarios, usuariosActivos, usuariosInactivos, registrosRecientes, usuariosPorRol] = await Promise.all([
            this.usuarioModel.countDocuments(),
            this.usuarioModel.countDocuments({ activo: true }),
            this.usuarioModel.countDocuments({ activo: false }),
            this.usuarioModel.countDocuments({
                fechaRegistro: { $gte: fechaLimite }
            }),
            this.usuarioModel.aggregate([
                { $group: { _id: '$rol', count: { $sum: 1 } } }
            ])
        ]);
        const rolesMap = {};
        usuariosPorRol.forEach(item => {
            rolesMap[item._id] = item.count;
        });
        return {
            totalUsuarios,
            usuariosActivos,
            usuariosInactivos,
            usuariosPorRol: rolesMap,
            registrosUltimos30Dias: registrosRecientes,
        };
    }
    async buscarUsuarios(termino) {
        return await this.usuarioModel
            .find({
            activo: true,
            $or: [
                { nombre: { $regex: termino, $options: 'i' } },
                { apellido: { $regex: termino, $options: 'i' } },
                { email: { $regex: termino, $options: 'i' } },
            ],
        })
            .select('-password')
            .limit(20)
            .exec();
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(usuario_schema_1.Usuario.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map