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
exports.PrestamosService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const prestamo_schema_1 = require("./schemas/prestamo.schema");
const pago_prestamo_schema_1 = require("./schemas/pago-prestamo.schema");
const fondo_schema_1 = require("./schemas/fondo.schema");
const prestamo_dto_1 = require("../../common/dto/prestamo.dto");
const fondos_service_1 = require("./fondos.service");
const financiero_interface_1 = require("../../common/interfaces/financiero.interface");
let PrestamosService = class PrestamosService {
    constructor(prestamoModel, pagoPrestamoModel, fondoModel, fondosService) {
        this.prestamoModel = prestamoModel;
        this.pagoPrestamoModel = pagoPrestamoModel;
        this.fondoModel = fondoModel;
        this.fondosService = fondosService;
    }
    async create(createPrestamoDto, usuarioId) {
        console.log(`💰 [PRESTAMOS] Creando préstamo para usuario ${usuarioId}:`, createPrestamoDto);
        const fondo = await this.fondosService.findOne(createPrestamoDto.fondoId, usuarioId);
        if (fondo.tipo !== financiero_interface_1.TipoFondo.PRESTAMO) {
            throw new common_1.BadRequestException('Solo se pueden crear préstamos en fondos de tipo "préstamo"');
        }
        if (fondo.saldoActual < createPrestamoDto.montoOriginal) {
            throw new common_1.BadRequestException(`Saldo insuficiente en el fondo. Disponible: ${fondo.saldoActual}, Requerido: ${createPrestamoDto.montoOriginal}`);
        }
        const nuevoPrestamo = new this.prestamoModel({
            ...createPrestamoDto,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            fondoId: new mongoose_2.Types.ObjectId(createPrestamoDto.fondoId),
            fechaPrestamo: createPrestamoDto.fechaPrestamo || new Date(),
            montoAbonado: 0,
            estado: prestamo_dto_1.EstadoPrestamo.ACTIVO,
            activo: true,
        });
        const prestamoGuardado = await nuevoPrestamo.save();
        await this.fondosService.actualizarSaldo(createPrestamoDto.fondoId, financiero_interface_1.TipoTransaccion.GASTO, createPrestamoDto.montoOriginal, usuarioId);
        console.log(`✅ [PRESTAMOS] Préstamo creado exitosamente:`, {
            id: prestamoGuardado._id,
            deudor: prestamoGuardado.nombreDeudor,
            monto: prestamoGuardado.montoOriginal
        });
        return prestamoGuardado;
    }
    async findAll(usuarioId, fondoId) {
        const filtro = {
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        };
        if (fondoId) {
            filtro.fondoId = new mongoose_2.Types.ObjectId(fondoId);
        }
        return await this.prestamoModel
            .find(filtro)
            .sort({ fechaPrestamo: -1 })
            .exec();
    }
    async findOne(id, usuarioId) {
        const prestamo = await this.prestamoModel.findOne({
            _id: id,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        }).exec();
        if (!prestamo) {
            throw new common_1.NotFoundException(`Préstamo con ID "${id}" no encontrado`);
        }
        return prestamo;
    }
    async update(id, updatePrestamoDto, usuarioId) {
        console.log(`🔄 [PRESTAMOS] Actualizando préstamo ${id}:`, updatePrestamoDto);
        await this.findOne(id, usuarioId);
        const prestamoActualizado = await this.prestamoModel
            .findOneAndUpdate({ _id: id, usuarioId: new mongoose_2.Types.ObjectId(usuarioId) }, updatePrestamoDto, { new: true })
            .exec();
        console.log(`✅ [PRESTAMOS] Préstamo actualizado exitosamente:`, {
            id: prestamoActualizado._id,
            deudor: prestamoActualizado.nombreDeudor,
            estado: prestamoActualizado.estado
        });
        return prestamoActualizado;
    }
    async remove(id, usuarioId) {
        console.log(`🗑️ Eliminando préstamo ${id}...`);
        const prestamo = await this.findOne(id, usuarioId);
        const saldoPendiente = prestamo.montoOriginal - prestamo.montoAbonado;
        if (saldoPendiente > 0) {
            await this.fondosService.actualizarSaldo(prestamo.fondoId.toString(), financiero_interface_1.TipoTransaccion.INGRESO, saldoPendiente, usuarioId);
            console.log(`💰 Devuelto saldo pendiente de ${saldoPendiente} al fondo`);
        }
        await this.pagoPrestamoModel.deleteMany({
            prestamoId: new mongoose_2.Types.ObjectId(id),
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        }).exec();
        await this.prestamoModel
            .findOneAndDelete({
            _id: id,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        })
            .exec();
        console.log(`✅ Préstamo eliminado exitosamente`);
    }
    async registrarPago(createPagoDto, usuarioId) {
        console.log(`💳 [PRESTAMOS] Registrando pago:`, createPagoDto);
        const prestamo = await this.findOne(createPagoDto.prestamoId, usuarioId);
        if (prestamo.estado === prestamo_dto_1.EstadoPrestamo.PAGADO) {
            throw new common_1.BadRequestException('Este préstamo ya está completamente pagado');
        }
        const saldoPendiente = prestamo.montoOriginal - prestamo.montoAbonado;
        if (createPagoDto.monto > saldoPendiente) {
            throw new common_1.BadRequestException(`El pago de ${createPagoDto.monto} excede el saldo pendiente de ${saldoPendiente}`);
        }
        const tipoPago = createPagoDto.monto === saldoPendiente ? prestamo_dto_1.TipoPago.PAGO_TOTAL : prestamo_dto_1.TipoPago.ABONO;
        const nuevoPago = new this.pagoPrestamoModel({
            ...createPagoDto,
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            prestamoId: new mongoose_2.Types.ObjectId(createPagoDto.prestamoId),
            fondoId: prestamo.fondoId,
            fechaPago: createPagoDto.fechaPago || new Date(),
            tipo: tipoPago,
            activo: true,
        });
        const pagoGuardado = await nuevoPago.save();
        const nuevoMontoAbonado = prestamo.montoAbonado + createPagoDto.monto;
        let nuevoEstado = prestamo.estado;
        if (nuevoMontoAbonado >= prestamo.montoOriginal) {
            nuevoEstado = prestamo_dto_1.EstadoPrestamo.PAGADO;
        }
        else if (nuevoMontoAbonado > 0) {
            nuevoEstado = prestamo_dto_1.EstadoPrestamo.PARCIAL;
        }
        await this.prestamoModel.findByIdAndUpdate(createPagoDto.prestamoId, {
            montoAbonado: nuevoMontoAbonado,
            estado: nuevoEstado
        });
        await this.fondosService.actualizarSaldo(prestamo.fondoId.toString(), financiero_interface_1.TipoTransaccion.INGRESO, createPagoDto.monto, usuarioId);
        console.log(`✅ [PRESTAMOS] Pago registrado exitosamente:`, {
            prestamo: prestamo.nombreDeudor,
            monto: createPagoDto.monto,
            tipo: tipoPago,
            nuevoEstado
        });
        return pagoGuardado;
    }
    async obtenerPagosPrestamo(prestamoId, usuarioId) {
        return await this.pagoPrestamoModel
            .find({
            prestamoId: new mongoose_2.Types.ObjectId(prestamoId),
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        })
            .sort({ fechaPago: -1 })
            .exec();
    }
    async obtenerEstadisticas(usuarioId, fondoId) {
        const filtro = { usuarioId: new mongoose_2.Types.ObjectId(usuarioId) };
        if (fondoId) {
            filtro.fondoId = new mongoose_2.Types.ObjectId(fondoId);
        }
        const prestamos = await this.prestamoModel.find(filtro).exec();
        const totalPrestamos = prestamos.length;
        const prestamosActivos = prestamos.filter(p => p.estado === prestamo_dto_1.EstadoPrestamo.ACTIVO || p.estado === prestamo_dto_1.EstadoPrestamo.PARCIAL).length;
        const prestamosPagados = prestamos.filter(p => p.estado === prestamo_dto_1.EstadoPrestamo.PAGADO).length;
        const prestamosVencidos = prestamos.filter(p => p.estado === prestamo_dto_1.EstadoPrestamo.VENCIDO).length;
        const montoTotalPrestado = prestamos.reduce((sum, p) => sum + p.montoOriginal, 0);
        const montoTotalRecuperado = prestamos.reduce((sum, p) => sum + p.montoAbonado, 0);
        const saldoPendienteTotal = prestamos.reduce((sum, p) => sum + (p.montoOriginal - p.montoAbonado), 0);
        const porcentajeRecuperacion = montoTotalPrestado > 0
            ? (montoTotalRecuperado / montoTotalPrestado) * 100
            : 0;
        return {
            totalPrestamos,
            prestamosActivos,
            prestamosPagados,
            prestamosVencidos,
            montoTotalPrestado,
            montoTotalRecuperado,
            saldoPendienteTotal,
            porcentajeRecuperacion: Math.round(porcentajeRecuperacion * 100) / 100
        };
    }
    async obtenerResumenPorDeudor(usuarioId, fondoId) {
        const filtro = { usuarioId: new mongoose_2.Types.ObjectId(usuarioId) };
        if (fondoId) {
            filtro.fondoId = new mongoose_2.Types.ObjectId(fondoId);
        }
        const prestamos = await this.prestamoModel.find(filtro).exec();
        const resumenPorDeudor = new Map();
        for (const prestamo of prestamos) {
            const deudor = prestamo.nombreDeudor;
            if (!resumenPorDeudor.has(deudor)) {
                resumenPorDeudor.set(deudor, {
                    nombreDeudor: deudor,
                    totalPrestamos: 0,
                    montoTotalPrestado: 0,
                    montoTotalAbonado: 0,
                    saldoPendiente: 0,
                    prestamos: []
                });
            }
            const resumen = resumenPorDeudor.get(deudor);
            resumen.totalPrestamos++;
            resumen.montoTotalPrestado += prestamo.montoOriginal;
            resumen.montoTotalAbonado += prestamo.montoAbonado;
            resumen.saldoPendiente += (prestamo.montoOriginal - prestamo.montoAbonado);
            resumen.prestamos.push(prestamo);
        }
        return Array.from(resumenPorDeudor.values())
            .sort((a, b) => b.saldoPendiente - a.saldoPendiente);
    }
    async actualizarEstadosVencidos() {
        const ahora = new Date();
        const resultado = await this.prestamoModel.updateMany({
            fechaVencimiento: { $lt: ahora },
            estado: { $in: [prestamo_dto_1.EstadoPrestamo.ACTIVO, prestamo_dto_1.EstadoPrestamo.PARCIAL] }
        }, { estado: prestamo_dto_1.EstadoPrestamo.VENCIDO });
        console.log(`🗓️ [PRESTAMOS] ${resultado.modifiedCount} préstamos marcados como vencidos`);
        return resultado.modifiedCount;
    }
};
exports.PrestamosService = PrestamosService;
exports.PrestamosService = PrestamosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(prestamo_schema_1.Prestamo.name)),
    __param(1, (0, mongoose_1.InjectModel)(pago_prestamo_schema_1.PagoPrestamo.name)),
    __param(2, (0, mongoose_1.InjectModel)(fondo_schema_1.Fondo.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        fondos_service_1.FondosService])
], PrestamosService);
//# sourceMappingURL=prestamos.service.js.map