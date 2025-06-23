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
        console.log(`🏦 [FONDOS] Creando fondo para usuario ${usuarioId}:`, createFondoDto);
        const fondoExistente = await this.fondoModel.findOne({
            nombre: createFondoDto.nombre,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        });
        if (fondoExistente) {
            throw new common_1.BadRequestException(`Ya existe un fondo con el nombre "${createFondoDto.nombre}"`);
        }
        let metaAhorro = 0;
        if (createFondoDto.tipo === 'ahorro') {
            if (!createFondoDto.metaAhorro || createFondoDto.metaAhorro <= 0) {
                throw new common_1.BadRequestException('La meta de ahorro es obligatoria y debe ser mayor a 0 para fondos de ahorro');
            }
            metaAhorro = createFondoDto.metaAhorro;
            console.log(`🎯 [FONDOS] Fondo de ahorro con meta obligatoria: ${metaAhorro}`);
        }
        else if (createFondoDto.tipo === 'registro') {
            metaAhorro = 0;
            if (createFondoDto.metaAhorro && createFondoDto.metaAhorro > 0) {
                throw new common_1.BadRequestException('Los fondos de registro no pueden tener meta de ahorro');
            }
            console.log(`📝 [FONDOS] Fondo de registro sin meta (prohibida)`);
        }
        const nuevoFondo = new this.fondoModel({
            ...createFondoDto,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            saldoActual: createFondoDto.saldoActual || 0,
            metaAhorro,
            fechaCreacion: new Date(),
            activo: true,
        });
        const fondoGuardado = await nuevoFondo.save();
        console.log(`✅ [FONDOS] Fondo creado exitosamente:`, {
            id: fondoGuardado._id,
            nombre: fondoGuardado.nombre,
            tipo: fondoGuardado.tipo,
            meta: fondoGuardado.metaAhorro
        });
        return fondoGuardado;
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
        console.log(`🔄 [FONDOS] Actualizando fondo ${id}:`, updateFondoDto);
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
        const datosActualizacion = { ...updateFondoDto };
        const tipoFinal = updateFondoDto.tipo || fondoExistente.tipo;
        if (tipoFinal === 'registro') {
            datosActualizacion.metaAhorro = 0;
            if (updateFondoDto.metaAhorro && updateFondoDto.metaAhorro > 0) {
                throw new common_1.BadRequestException('Los fondos de registro no pueden tener meta de ahorro');
            }
            console.log(`📝 [FONDOS] Actualizando a fondo de registro (meta prohibida)`);
        }
        else if (tipoFinal === 'ahorro') {
            if (updateFondoDto.metaAhorro !== undefined) {
                if (updateFondoDto.metaAhorro <= 0) {
                    throw new common_1.BadRequestException('La meta de ahorro debe ser mayor a 0 para fondos de ahorro');
                }
                datosActualizacion.metaAhorro = updateFondoDto.metaAhorro;
            }
            console.log(`🎯 [FONDOS] Actualizando fondo de ahorro con meta: ${datosActualizacion.metaAhorro}`);
        }
        const fondoActualizado = await this.fondoModel
            .findOneAndUpdate({ _id: id, usuarioId: new mongoose_2.Types.ObjectId(usuarioId) }, datosActualizacion, { new: true })
            .exec();
        console.log(`✅ [FONDOS] Fondo actualizado exitosamente:`, {
            id: fondoActualizado._id,
            nombre: fondoActualizado.nombre,
            tipo: fondoActualizado.tipo,
            meta: fondoActualizado.metaAhorro
        });
        return fondoActualizado;
    }
    async remove(id, usuarioId) {
        console.log(`🗑️ Eliminando fondo ${id} y sus transacciones asociadas...`);
        const fondo = await this.findOne(id, usuarioId);
        const transaccionesCount = await this.transaccionModel.countDocuments({
            fondoId: new mongoose_2.Types.ObjectId(id),
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        });
        if (transaccionesCount > 0) {
            console.log(`📋 Eliminando ${transaccionesCount} transacción(es) asociadas al fondo "${fondo.nombre}"...`);
            await this.transaccionModel.deleteMany({
                fondoId: new mongoose_2.Types.ObjectId(id),
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
            }).exec();
            console.log(`✅ ${transaccionesCount} transacción(es) eliminadas`);
        }
        await this.fondoModel
            .findOneAndDelete({
            _id: id,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        })
            .exec();
        console.log(`✅ Fondo "${fondo.nombre}" eliminado exitosamente`);
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
    async getEstadisticasPersonalizadas(usuarioId) {
        const fondos = await this.fondoModel
            .find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        })
            .exec();
        const fondosActivos = fondos.filter(f => f.activo);
        const fondosConMetas = fondosActivos.filter(f => f.metaAhorro && f.metaAhorro > 0);
        const saldoTotal = fondosActivos.reduce((sum, f) => sum + f.saldoActual, 0);
        const metaPromedio = fondosConMetas.length > 0
            ? fondosConMetas.reduce((sum, f) => sum + f.metaAhorro, 0) / fondosConMetas.length
            : 0;
        let fondoMayorSaldo = null;
        if (fondosActivos.length > 0) {
            const fondoMaximo = fondosActivos.reduce((prev, current) => prev.saldoActual > current.saldoActual ? prev : current);
            fondoMayorSaldo = {
                nombre: fondoMaximo.nombre,
                saldo: fondoMaximo.saldoActual
            };
        }
        let progresoPromedio = 0;
        if (fondosConMetas.length > 0) {
            const progresoTotal = fondosConMetas.reduce((sum, f) => {
                const progreso = (f.saldoActual / f.metaAhorro) * 100;
                return sum + Math.min(progreso, 100);
            }, 0);
            progresoPromedio = progresoTotal / fondosConMetas.length;
        }
        return {
            totalFondos: fondos.length,
            fondosActivos: fondosActivos.length,
            fondosConMetas: fondosConMetas.length,
            metaPromedioAhorro: metaPromedio,
            saldoTotalActual: saldoTotal,
            fondoMayorSaldo,
            progresoPromedioMetas: Math.round(progresoPromedio * 100) / 100
        };
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
//# sourceMappingURL=fondos.service.js.map