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
exports.TransaccionesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transaccion_schema_1 = require("./schemas/transaccion.schema");
const fondos_service_1 = require("../fondos/fondos.service");
let TransaccionesService = class TransaccionesService {
    constructor(transaccionModel, fondosService) {
        this.transaccionModel = transaccionModel;
        this.fondosService = fondosService;
    }
    async create(createTransaccionDto, usuarioId) {
        console.log('💰 CREAR TRANSACCIÓN - Actualizando saldo del fondo');
        console.log('📊 Datos de creación:', createTransaccionDto);
        const fondo = await this.fondosService.findOne(createTransaccionDto.fondoId, usuarioId);
        if (createTransaccionDto.tipo === 'gasto' && fondo.saldoActual < createTransaccionDto.monto) {
            console.warn(`⚠️ Gasto mayor al saldo disponible: Fondo "${fondo.nombre}" tiene ${fondo.saldoActual}, gasto solicitado: ${createTransaccionDto.monto}`);
        }
        await this.fondosService.actualizarSaldo(createTransaccionDto.fondoId, createTransaccionDto.tipo, createTransaccionDto.monto, usuarioId);
        const nuevaTransaccion = new this.transaccionModel({
            ...createTransaccionDto,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            fondoId: new mongoose_2.Types.ObjectId(createTransaccionDto.fondoId),
            fecha: createTransaccionDto.fecha || new Date(),
        });
        const transaccionGuardada = await nuevaTransaccion.save();
        console.log('✅ Transacción creada y saldo actualizado');
        return await this.transaccionModel
            .findById(transaccionGuardada._id)
            .populate('fondoId', 'nombre tipo')
            .exec();
    }
    async findAll(usuarioId, filtros = {}) {
        const { tipo, categoria, fechaInicio, fechaFin, montoMin, montoMax, page = 1, limit = 10, pagina, limite } = filtros;
        const pageNum = page || pagina || 1;
        const limitNum = limit || limite || 10;
        const filtrosConsulta = {
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        };
        if (tipo)
            filtrosConsulta.tipo = tipo;
        if (categoria)
            filtrosConsulta.categoria = categoria;
        if (fechaInicio || fechaFin) {
            filtrosConsulta.fecha = {};
            if (fechaInicio)
                filtrosConsulta.fecha.$gte = new Date(fechaInicio);
            if (fechaFin)
                filtrosConsulta.fecha.$lte = new Date(fechaFin);
        }
        if (montoMin !== undefined || montoMax !== undefined) {
            filtrosConsulta.monto = {};
            if (montoMin !== undefined)
                filtrosConsulta.monto.$gte = montoMin;
            if (montoMax !== undefined)
                filtrosConsulta.monto.$lte = montoMax;
        }
        const skip = (pageNum - 1) * limitNum;
        const [transacciones, total] = await Promise.all([
            this.transaccionModel
                .find(filtrosConsulta)
                .populate({
                path: 'fondoId',
                select: 'nombre tipo descripcion',
                strictPopulate: false
            })
                .sort({ fecha: -1 })
                .skip(skip)
                .limit(limitNum)
                .exec(),
            this.transaccionModel.countDocuments(filtrosConsulta),
        ]);
        return {
            transacciones,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }
    async findByFondo(fondoId, usuarioId, filtros = {}) {
        await this.fondosService.findOne(fondoId, usuarioId);
        const filtrosConsulta = {
            fondoId: new mongoose_2.Types.ObjectId(fondoId),
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        };
        if (filtros.tipo)
            filtrosConsulta.tipo = filtros.tipo;
        if (filtros.categoria)
            filtrosConsulta.categoria = filtros.categoria;
        if (filtros.fechaInicio || filtros.fechaFin) {
            filtrosConsulta.fecha = {};
            if (filtros.fechaInicio)
                filtrosConsulta.fecha.$gte = new Date(filtros.fechaInicio);
            if (filtros.fechaFin)
                filtrosConsulta.fecha.$lte = new Date(filtros.fechaFin);
        }
        return await this.transaccionModel
            .find(filtrosConsulta)
            .sort({ fecha: -1 })
            .exec();
    }
    async findOne(id, usuarioId) {
        const transaccion = await this.transaccionModel
            .findOne({
            _id: id,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        })
            .populate('fondoId', 'nombre tipo')
            .exec();
        if (!transaccion) {
            throw new common_1.NotFoundException(`Transacción con ID "${id}" no encontrada`);
        }
        return transaccion;
    }
    async update(id, updateTransaccionDto, usuarioId) {
        console.log('🔄 EDITAR TRANSACCIÓN - Recalculando saldo del fondo');
        console.log('📊 Datos de actualización:', updateTransaccionDto);
        const transaccionOriginal = await this.findOne(id, usuarioId);
        const fondoOriginalId = typeof transaccionOriginal.fondoId === 'object' && transaccionOriginal.fondoId._id
            ? transaccionOriginal.fondoId._id.toString()
            : transaccionOriginal.fondoId.toString();
        console.log('📋 Transacción original:', {
            tipo: transaccionOriginal.tipo,
            monto: transaccionOriginal.monto,
            fondoId: fondoOriginalId
        });
        console.log('🔄 PASO 1: Revirtiendo efecto original...');
        const tipoOriginalInverso = transaccionOriginal.tipo === 'ingreso' ? 'gasto' : 'ingreso';
        await this.fondosService.actualizarSaldo(fondoOriginalId, tipoOriginalInverso, transaccionOriginal.monto, usuarioId);
        console.log('✅ Efecto original revertido');
        const nuevoTipo = updateTransaccionDto.tipo || transaccionOriginal.tipo;
        const nuevoMonto = updateTransaccionDto.monto !== undefined ? updateTransaccionDto.monto : transaccionOriginal.monto;
        const nuevoFondoId = updateTransaccionDto.fondoId || fondoOriginalId;
        console.log('📊 Nuevos valores a aplicar:', { nuevoTipo, nuevoMonto, nuevoFondoId });
        console.log('🔄 PASO 2: Aplicando nuevos valores...');
        await this.fondosService.actualizarSaldo(nuevoFondoId, nuevoTipo, nuevoMonto, usuarioId);
        console.log('✅ Nuevos valores aplicados al saldo');
        const updateData = {};
        if (updateTransaccionDto.descripcion !== undefined)
            updateData.descripcion = updateTransaccionDto.descripcion;
        if (updateTransaccionDto.monto !== undefined)
            updateData.monto = updateTransaccionDto.monto;
        if (updateTransaccionDto.tipo !== undefined)
            updateData.tipo = updateTransaccionDto.tipo;
        if (updateTransaccionDto.categoria !== undefined)
            updateData.categoria = updateTransaccionDto.categoria;
        if (updateTransaccionDto.notas !== undefined)
            updateData.notas = updateTransaccionDto.notas;
        if (updateTransaccionDto.etiquetas !== undefined)
            updateData.etiquetas = updateTransaccionDto.etiquetas;
        if (updateTransaccionDto.fondoId !== undefined)
            updateData.fondoId = new mongoose_2.Types.ObjectId(updateTransaccionDto.fondoId);
        const transaccionActualizada = await this.transaccionModel
            .findOneAndUpdate({ _id: id, usuarioId: new mongoose_2.Types.ObjectId(usuarioId) }, updateData, { new: true })
            .populate('fondoId', 'nombre tipo')
            .exec();
        console.log('✅ Transacción editada y saldo recalculado');
        return transaccionActualizada;
    }
    async remove(id, usuarioId) {
        console.log('🗑️ ELIMINAR TRANSACCIÓN - Revirtiendo saldo del fondo');
        const transaccion = await this.findOne(id, usuarioId);
        const fondoId = typeof transaccion.fondoId === 'object' && transaccion.fondoId._id
            ? transaccion.fondoId._id.toString()
            : transaccion.fondoId.toString();
        console.log('📋 Transacción a eliminar:', {
            tipo: transaccion.tipo,
            monto: transaccion.monto,
            descripcion: transaccion.descripcion,
            fondoId: fondoId
        });
        console.log('🔄 Revirtiendo efecto en el saldo...');
        const tipoInverso = transaccion.tipo === 'ingreso' ? 'gasto' : 'ingreso';
        await this.fondosService.actualizarSaldo(fondoId, tipoInverso, transaccion.monto, usuarioId);
        console.log('✅ Efecto revertido en el saldo');
        await this.transaccionModel.findOneAndDelete({
            _id: id,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        }).exec();
        console.log('✅ Transacción eliminada y saldo revertido');
    }
    async getEstadisticasPorCategoria(fondoId) {
        const filtros = {};
        if (fondoId) {
            filtros.fondoId = new mongoose_2.Types.ObjectId(fondoId);
        }
        const estadisticas = await this.transaccionModel.aggregate([
            { $match: filtros },
            {
                $group: {
                    _id: '$categoria',
                    total: { $sum: '$monto' },
                    cantidad: { $sum: 1 },
                    promedio: { $avg: '$monto' },
                },
            },
            {
                $project: {
                    categoria: '$_id',
                    total: 1,
                    cantidad: 1,
                    promedio: { $round: ['$promedio', 2] },
                    _id: 0,
                },
            },
            { $sort: { total: -1 } },
        ]);
        return estadisticas;
    }
    async getResumenMensual(año, mes, fondoId) {
        const fechaInicio = new Date(año, mes - 1, 1);
        const fechaFin = new Date(año, mes, 0, 23, 59, 59);
        const filtros = {
            fecha: { $gte: fechaInicio, $lte: fechaFin }
        };
        if (fondoId) {
            filtros.fondoId = new mongoose_2.Types.ObjectId(fondoId);
        }
        const resumen = await this.transaccionModel.aggregate([
            { $match: filtros },
            {
                $group: {
                    _id: null,
                    ingresos: {
                        $sum: {
                            $cond: [{ $eq: ['$tipo', 'ingreso'] }, '$monto', 0]
                        }
                    },
                    gastos: {
                        $sum: {
                            $cond: [{ $eq: ['$tipo', 'gasto'] }, '$monto', 0]
                        }
                    },
                    transacciones: { $sum: 1 },
                },
            },
            {
                $project: {
                    ingresos: 1,
                    gastos: 1,
                    balance: { $subtract: ['$ingresos', '$gastos'] },
                    transacciones: 1,
                    _id: 0,
                },
            },
        ]);
        return resumen[0] || { ingresos: 0, gastos: 0, balance: 0, transacciones: 0 };
    }
};
exports.TransaccionesService = TransaccionesService;
exports.TransaccionesService = TransaccionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transaccion_schema_1.Transaccion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        fondos_service_1.FondosService])
], TransaccionesService);
//# sourceMappingURL=transacciones.service.js.map