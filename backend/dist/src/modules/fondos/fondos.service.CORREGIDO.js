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
exports.FondosService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fondo_schema_1 = require("./schemas/fondo.schema");
const transaccion_schema_1 = require("../transacciones/schemas/transaccion.schema");
let FondosService = class FondosService {
    constructor(fondoModel, transaccionModel) {
        this.fondoModel = fondoModel;
        this.transaccionModel = transaccionModel;
    }
    async create(createFondoDto, usuarioId) {
        const fondoExistente = await this.fondoModel.findOne({
            nombre: createFondoDto.nombre,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        });
        if (fondoExistente) {
            throw new common_1.BadRequestException(`Ya existe un fondo con el nombre "${createFondoDto.nombre}"`);
        }
        const nuevoFondo = new this.fondoModel({
            ...createFondoDto,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            saldoActual: createFondoDto.saldoActual || 0,
            metaAhorro: createFondoDto.metaAhorro || 0,
            fechaCreacion: new Date(),
            activo: true,
        });
        return await nuevoFondo.save();
    }
    async findAll(usuarioId) {
        return await this.fondoModel
            .find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        })
            .sort({ fechaCreacion: -1 })
            .exec();
    }
    async findOne(id, usuarioId) {
        const fondo = await this.fondoModel.findOne({
            _id: id,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        }).exec();
        if (!fondo) {
            throw new common_1.NotFoundException(`Fondo con ID "${id}" no encontrado`);
        }
        return fondo;
    }
    async update(id, updateFondoDto, usuarioId) {
        const fondoExistente = await this.findOne(id, usuarioId);
        if (updateFondoDto.nombre && updateFondoDto.nombre !== fondoExistente.nombre) {
            const nombreDuplicado = await this.fondoModel.findOne({
                nombre: updateFondoDto.nombre,
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
                _id: { $ne: id }
            });
            if (nombreDuplicado) {
                throw new common_1.BadRequestException(`Ya existe un fondo con el nombre "${updateFondoDto.nombre}"`);
            }
        }
        const fondoActualizado = await this.fondoModel
            .findOneAndUpdate({ _id: id, usuarioId: new mongoose_2.Types.ObjectId(usuarioId) }, updateFondoDto, { new: true })
            .exec();
        return fondoActualizado;
    }
    async remove(id, usuarioId) {
        console.log(`🗑️ Backend - Iniciando eliminación COMPLETA del fondo: ${id}`);
        const fondo = await this.findOne(id, usuarioId);
        console.log(`📋 Fondo encontrado: "${fondo.nombre}"`);
        const transaccionesAsociadas = await this.transaccionModel.find({
            fondoId: new mongoose_2.Types.ObjectId(id),
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        });
        console.log(`📊 Transacciones asociadas encontradas: ${transaccionesAsociadas.length}`);
        if (transaccionesAsociadas.length > 0) {
            console.log(`🔥 Eliminando ${transaccionesAsociadas.length} transacciones asociadas...`);
            const resultadoTransacciones = await this.transaccionModel.deleteMany({
                fondoId: new mongoose_2.Types.ObjectId(id),
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
            });
            console.log(`✅ Transacciones eliminadas: ${resultadoTransacciones.deletedCount}`);
        }
        else {
            console.log(`ℹ️ No hay transacciones asociadas para eliminar`);
        }
        console.log(`🔥 Eliminando fondo "${fondo.nombre}" de la base de datos...`);
        const resultadoFondo = await this.fondoModel
            .findOneAndDelete({
            _id: id,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        })
            .exec();
        if (!resultadoFondo) {
            throw new common_1.NotFoundException(`Error: No se pudo eliminar el fondo con ID "${id}"`);
        }
        console.log(`✅ Backend - Eliminación COMPLETA exitosa:`);
        console.log(`   📁 Fondo eliminado: "${fondo.nombre}"`);
        console.log(`   📊 Transacciones eliminadas: ${transaccionesAsociadas.length}`);
        console.log(`   🗃️ Eliminación física de la base de datos completada`);
    }
    async findByTipo(tipo, usuarioId) {
        return await this.fondoModel
            .find({
            tipo,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        })
            .sort({ fechaCreacion: -1 })
            .exec();
    }
    async getTotalFondos(usuarioId) {
        return await this.fondoModel.countDocuments({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        });
    }
    async getFondosConMetas(usuarioId) {
        return await this.fondoModel
            .find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true,
            metaAhorro: { $gt: 0 }
        })
            .sort({ metaAhorro: -1 })
            .exec();
    }
    async actualizarSaldo(fondoId, tipo, monto, usuarioId) {
        const fondo = await this.findOne(fondoId, usuarioId);
        const nuevoSaldo = tipo === 'ingreso'
            ? fondo.saldoActual + monto
            : fondo.saldoActual - monto;
        if (nuevoSaldo < 0) {
            console.warn(`⚠️ Saldo negativo en fondo "${fondo.nombre}": ${nuevoSaldo}`);
        }
        return await this.fondoModel
            .findOneAndUpdate({ _id: fondoId, usuarioId: new mongoose_2.Types.ObjectId(usuarioId) }, { saldoActual: nuevoSaldo }, { new: true })
            .exec();
    }
};
exports.FondosService = FondosService;
exports.FondosService = FondosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(fondo_schema_1.Fondo.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaccion_schema_1.Transaccion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], FondosService);
//# sourceMappingURL=fondos.service.CORREGIDO.js.map