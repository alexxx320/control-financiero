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
exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fondo_schema_1 = require("../fondos/schemas/fondo.schema");
const transaccion_schema_1 = require("../transacciones/schemas/transaccion.schema");
const financiero_interface_1 = require("../../common/interfaces/financiero.interface");
const moment_1 = require("moment");
let ReportesService = class ReportesService {
    constructor(fondoModel, transaccionModel) {
        this.fondoModel = fondoModel;
        this.transaccionModel = transaccionModel;
    }
    async generarReporteMensual(mes, año, usuarioId) {
        console.log(`📊 Generando reporte mensual para usuario ${usuarioId}: ${mes}/${año}`);
        if (mes < 1 || mes > 12) {
            throw new Error('El mes debe estar entre 1 y 12');
        }
        const fechaInicio = new Date(año, mes - 1, 1);
        const fechaFin = new Date(año, mes, 0, 23, 59, 59);
        const fondos = await this.fondoModel.find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        }).exec();
        const reportesFondos = [];
        let totalIngresosMes = 0;
        let totalGastosMes = 0;
        let totalTransacciones = 0;
        for (const fondo of fondos) {
            const transaccionesMes = await this.transaccionModel
                .find({
                fondoId: fondo._id,
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
                fecha: { $gte: fechaInicio, $lte: fechaFin }
            })
                .exec();
            const ingresosMes = transaccionesMes
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO)
                .reduce((sum, t) => sum + t.monto, 0);
            const gastosMes = transaccionesMes
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO)
                .reduce((sum, t) => sum + t.monto, 0);
            const todasTransacciones = await this.transaccionModel
                .find({
                fondoId: fondo._id,
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
            })
                .exec();
            const totalIngresosFondo = todasTransacciones
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO)
                .reduce((sum, t) => sum + t.monto, 0);
            const totalGastosFondo = todasTransacciones
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO)
                .reduce((sum, t) => sum + t.monto, 0);
            const balanceFinal = totalIngresosFondo - totalGastosFondo;
            const balanceInicial = balanceFinal - (ingresosMes - gastosMes);
            reportesFondos.push({
                nombre: fondo.nombre,
                balanceInicial,
                ingresos: ingresosMes,
                gastos: gastosMes,
                balanceNeto: ingresosMes - gastosMes,
                balanceFinal,
                transacciones: transaccionesMes.length,
            });
            totalIngresosMes += ingresosMes;
            totalGastosMes += gastosMes;
            totalTransacciones += transaccionesMes.length;
        }
        const resumen = {
            totalIngresos: totalIngresosMes,
            totalGastos: totalGastosMes,
            balanceNeto: totalIngresosMes - totalGastosMes,
            transaccionesTotales: totalTransacciones,
        };
        console.log(`✅ Reporte mensual generado para usuario ${usuarioId}:`, resumen);
        return {
            periodo: (0, moment_1.default)().month(mes - 1).year(año).format('MMMM YYYY'),
            mes,
            año,
            fondos: reportesFondos,
            resumen,
        };
    }
    async obtenerAlertasFinancieras(usuarioId) {
        console.log(`🚨 Obteniendo alertas financieras para usuario ${usuarioId}`);
        const alertas = [];
        const fondos = await this.fondoModel.find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        }).exec();
        for (const fondo of fondos) {
            const transacciones = await this.transaccionModel
                .find({
                fondoId: fondo._id,
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
            })
                .exec();
            const totalIngresos = transacciones
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO)
                .reduce((sum, t) => sum + t.monto, 0);
            const totalGastos = transacciones
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO)
                .reduce((sum, t) => sum + t.monto, 0);
            const balance = totalIngresos - totalGastos;
            if (balance < 0) {
                alertas.push({
                    tipo: financiero_interface_1.TipoAlerta.ERROR,
                    fondo: fondo.nombre,
                    mensaje: `Balance negativo: $${Math.abs(balance).toLocaleString()}`,
                    prioridad: financiero_interface_1.PrioridadAlerta.ALTA,
                });
            }
            if (fondo.metaAhorro > 0) {
                const progresoMeta = (balance / fondo.metaAhorro) * 100;
                if (progresoMeta >= 90) {
                    alertas.push({
                        tipo: financiero_interface_1.TipoAlerta.EXITO,
                        fondo: fondo.nombre,
                        mensaje: `¡Cerca de la meta! Progreso: ${progresoMeta.toFixed(1)}%`,
                        prioridad: financiero_interface_1.PrioridadAlerta.BAJA,
                    });
                }
                else if (progresoMeta < 25) {
                    alertas.push({
                        tipo: financiero_interface_1.TipoAlerta.ADVERTENCIA,
                        fondo: fondo.nombre,
                        mensaje: `Progreso bajo hacia la meta: ${progresoMeta.toFixed(1)}%`,
                        prioridad: financiero_interface_1.PrioridadAlerta.MEDIA,
                    });
                }
            }
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - 30);
            const transaccionesRecientes = transacciones.filter(t => t.fecha >= fechaLimite);
            if (transacciones.length > 0 && transaccionesRecientes.length === 0) {
                alertas.push({
                    tipo: financiero_interface_1.TipoAlerta.INFO,
                    fondo: fondo.nombre,
                    mensaje: 'Sin movimientos en los últimos 30 días',
                    prioridad: financiero_interface_1.PrioridadAlerta.BAJA,
                });
            }
        }
        const balanceTotal = await this.calcularBalanceTotal(usuarioId);
        if (balanceTotal < 0) {
            alertas.push({
                tipo: financiero_interface_1.TipoAlerta.ERROR,
                fondo: 'General',
                mensaje: `Balance total negativo: $${Math.abs(balanceTotal).toLocaleString()}`,
                prioridad: financiero_interface_1.PrioridadAlerta.ALTA,
            });
        }
        return alertas.sort((a, b) => {
            const prioridadOrden = { alta: 3, media: 2, baja: 1 };
            return prioridadOrden[b.prioridad] - prioridadOrden[a.prioridad];
        });
    }
    async obtenerEstadisticasGenerales(usuarioId) {
        console.log(`📈 Obteniendo estadísticas generales para usuario ${usuarioId}`);
        const [fondos, transacciones] = await Promise.all([
            this.fondoModel.find({
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
                activo: true
            }).exec(),
            this.transaccionModel.find({
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
            }).exec(),
        ]);
        const totalIngresos = transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO)
            .reduce((sum, t) => sum + t.monto, 0);
        const totalGastos = transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO)
            .reduce((sum, t) => sum + t.monto, 0);
        const balanceTotal = totalIngresos - totalGastos;
        let fondoMayorBalance = 'N/A';
        let mayorBalance = -Infinity;
        for (const fondo of fondos) {
            const transaccionesFondo = transacciones.filter(t => t.fondoId.toString() === fondo._id.toString());
            const ingresosFondo = transaccionesFondo
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO)
                .reduce((sum, t) => sum + t.monto, 0);
            const gastosFondo = transaccionesFondo
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO)
                .reduce((sum, t) => sum + t.monto, 0);
            const balanceFondo = ingresosFondo - gastosFondo;
            if (balanceFondo > mayorBalance) {
                mayorBalance = balanceFondo;
                fondoMayorBalance = fondo.nombre;
            }
        }
        const conteoCategoria = {};
        transacciones.forEach(t => {
            conteoCategoria[t.categoria] = (conteoCategoria[t.categoria] || 0) + 1;
        });
        const categoriaFrecuente = Object.keys(conteoCategoria).reduce((a, b) => conteoCategoria[a] > conteoCategoria[b] ? a : b) || financiero_interface_1.CategoriaTransaccion.OTROS;
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 12);
        const gastosUltimoAño = transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.fecha >= fechaInicio)
            .reduce((sum, t) => sum + t.monto, 0);
        const promedioGastoMensual = gastosUltimoAño / 12;
        return {
            totalFondos: fondos.length,
            totalTransacciones: transacciones.length,
            balanceTotal,
            fondoMayorBalance,
            categoriaFrecuente,
            promedioGastoMensual: Math.round(promedioGastoMensual * 100) / 100,
        };
    }
    async generarReporteAnual(año, usuarioId) {
        console.log(`📅 Generando reporte anual para usuario ${usuarioId}: ${año}`);
        const meses = [];
        let totalIngresosAnual = 0;
        let totalGastosAnual = 0;
        for (let mes = 1; mes <= 12; mes++) {
            const reporteMes = await this.generarReporteMensual(mes, año, usuarioId);
            meses.push({
                mes,
                nombreMes: (0, moment_1.default)().month(mes - 1).format('MMMM'),
                ingresos: reporteMes.resumen.totalIngresos,
                gastos: reporteMes.resumen.totalGastos,
                balance: reporteMes.resumen.balanceNeto,
                transacciones: reporteMes.resumen.transaccionesTotales,
            });
            totalIngresosAnual += reporteMes.resumen.totalIngresos;
            totalGastosAnual += reporteMes.resumen.totalGastos;
        }
        const mesesConBalance = meses.filter(m => m.transacciones > 0);
        const mejorMes = mesesConBalance.length > 0
            ? mesesConBalance.reduce((prev, current) => prev.balance > current.balance ? prev : current)
            : null;
        const peorMes = mesesConBalance.length > 0
            ? mesesConBalance.reduce((prev, current) => prev.balance < current.balance ? prev : current)
            : null;
        return {
            año,
            meses,
            resumenAnual: {
                totalIngresos: totalIngresosAnual,
                totalGastos: totalGastosAnual,
                balanceNeto: totalIngresosAnual - totalGastosAnual,
                mejorMes: mejorMes ? {
                    nombre: mejorMes.nombreMes,
                    balance: mejorMes.balance
                } : null,
                peorMes: peorMes ? {
                    nombre: peorMes.nombreMes,
                    balance: peorMes.balance
                } : null,
            },
        };
    }
    async calcularBalanceTotal(usuarioId) {
        const transacciones = await this.transaccionModel.find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        }).exec();
        return transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO)
            .reduce((sum, t) => sum + t.monto, 0) -
            transacciones
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO)
                .reduce((sum, t) => sum + t.monto, 0);
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(fondo_schema_1.Fondo.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaccion_schema_1.Transaccion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ReportesService);
//# sourceMappingURL=reportes.service.js.map