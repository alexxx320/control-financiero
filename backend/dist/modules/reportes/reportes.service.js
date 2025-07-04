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
        console.log(`📅 Rango de fechas: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`);
        const fondos = await this.fondoModel.find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        }).exec();
        console.log(`💰 Fondos encontrados: ${fondos.length}`);
        const reportesFondos = [];
        let totalIngresosMes = 0;
        let totalGastosMes = 0;
        let totalTransacciones = 0;
        for (const fondo of fondos) {
            console.log(`📋 Procesando fondo: ${fondo.nombre} (ID: ${fondo._id})`);
            const transaccionesMes = await this.transaccionModel
                .find({
                fondoId: fondo._id,
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
                fecha: { $gte: fechaInicio, $lte: fechaFin }
            })
                .exec();
            console.log(`📊 Transacciones del mes para ${fondo.nombre}: ${transaccionesMes.length}`);
            const ingresosMes = transaccionesMes
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            const gastosMes = transaccionesMes
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            console.log(`💰 ${fondo.nombre} - Ingresos: ${ingresosMes}, Gastos: ${gastosMes}`);
            const todasTransacciones = await this.transaccionModel
                .find({
                fondoId: fondo._id,
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
            })
                .exec();
            console.log(`📈 Transacciones históricas para ${fondo.nombre}: ${todasTransacciones.length}`);
            const totalIngresosFondo = todasTransacciones
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            const totalGastosFondo = todasTransacciones
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            const balanceFinal = fondo.saldoActual;
            const balanceInicial = balanceFinal - (ingresosMes - gastosMes);
            const reporteFondo = {
                nombre: fondo.nombre,
                balanceInicial,
                ingresos: ingresosMes,
                gastos: gastosMes,
                balanceNeto: ingresosMes - gastosMes,
                balanceFinal,
                transacciones: transaccionesMes.length,
            };
            console.log(`📊 Reporte de fondo ${fondo.nombre}:`, reporteFondo);
            reportesFondos.push(reporteFondo);
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
        console.log(`✅ Reporte mensual generado para usuario ${usuarioId}:`, {
            fondos: reportesFondos.length,
            resumen
        });
        const fecha = new Date(año, mes - 1, 1);
        const periodo = fecha.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });
        return {
            periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1),
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
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            const totalGastos = transacciones
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.categoria !== 'transferencia')
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
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
            .reduce((sum, t) => sum + t.monto, 0);
        const totalGastos = transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.categoria !== 'transferencia')
            .reduce((sum, t) => sum + t.monto, 0);
        const balanceTotal = totalIngresos - totalGastos;
        const sumaTotalFondos = fondos.reduce((sum, fondo) => sum + (fondo.saldoActual || 0), 0);
        console.log(`💰 Patrimonio Total calculado: ${sumaTotalFondos}`);
        let fondoMayorBalance = 'N/A';
        let mayorBalance = -Infinity;
        for (const fondo of fondos) {
            const transaccionesFondo = transacciones.filter(t => t.fondoId.toString() === fondo._id.toString());
            const ingresosFondo = transaccionesFondo
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            const gastosFondo = transaccionesFondo
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.categoria !== 'transferencia')
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
        let categoriaFrecuente = financiero_interface_1.CategoriaTransaccion.OTROS;
        if (Object.keys(conteoCategoria).length > 0) {
            categoriaFrecuente = Object.keys(conteoCategoria).reduce((a, b) => conteoCategoria[a] > conteoCategoria[b] ? a : b);
        }
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 12);
        const gastosUltimoAño = transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.categoria !== 'transferencia' && t.fecha >= fechaInicio)
            .reduce((sum, t) => sum + t.monto, 0);
        const promedioGastoMensual = gastosUltimoAño / 12;
        return {
            totalFondos: fondos.length,
            totalTransacciones: transacciones.length,
            balanceTotal,
            fondoMayorBalance,
            categoriaFrecuente,
            promedioGastoMensual: Math.round(promedioGastoMensual * 100) / 100,
            sumaTotalFondos,
        };
    }
    async generarReporteAnual(año, usuarioId) {
        console.log(`📅 Generando reporte anual para usuario ${usuarioId}: ${año}`);
        const meses = [];
        let totalIngresosAnual = 0;
        let totalGastosAnual = 0;
        for (let mes = 1; mes <= 12; mes++) {
            const reporteMes = await this.generarReporteMensual(mes, año, usuarioId);
            const fechaMes = new Date(año, mes - 1, 1);
            const nombreMes = fechaMes.toLocaleDateString('es-ES', { month: 'long' });
            meses.push({
                mes,
                nombreMes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
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
    async generarReportePorPeriodo(fechaInicio, fechaFin, nombrePeriodo, usuarioId) {
        console.log(`📊 Generando reporte para período personalizado: ${nombrePeriodo}`);
        console.log(`📅 Rango: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`);
        const fondos = await this.fondoModel.find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        }).exec();
        console.log(`💰 Fondos encontrados: ${fondos.length}`);
        const reportesFondos = [];
        let totalIngresosPeriodo = 0;
        let totalGastosPeriodo = 0;
        let totalTransacciones = 0;
        for (const fondo of fondos) {
            console.log(`📋 Procesando fondo: ${fondo.nombre} (ID: ${fondo._id})`);
            const transaccionesPeriodo = await this.transaccionModel
                .find({
                fondoId: fondo._id,
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
                fecha: { $gte: fechaInicio, $lte: fechaFin }
            })
                .exec();
            console.log(`📊 Transacciones del período para ${fondo.nombre}: ${transaccionesPeriodo.length}`);
            const ingresosPeriodo = transaccionesPeriodo
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            const gastosPeriodo = transaccionesPeriodo
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            console.log(`💰 ${fondo.nombre} - Ingresos: ${ingresosPeriodo}, Gastos: ${gastosPeriodo}`);
            const todasTransaccionesAnteriores = await this.transaccionModel
                .find({
                fondoId: fondo._id,
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
                fecha: { $lt: fechaInicio }
            })
                .exec();
            const ingresosAnteriores = todasTransaccionesAnteriores
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            const gastosAnteriores = todasTransaccionesAnteriores
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.categoria !== 'transferencia')
                .reduce((sum, t) => sum + t.monto, 0);
            const balanceInicial = ingresosAnteriores - gastosAnteriores;
            const balanceFinal = balanceInicial + (ingresosPeriodo - gastosPeriodo);
            const reporteFondo = {
                nombre: fondo.nombre,
                balanceInicial,
                ingresos: ingresosPeriodo,
                gastos: gastosPeriodo,
                balanceNeto: ingresosPeriodo - gastosPeriodo,
                balanceFinal,
                transacciones: transaccionesPeriodo.length,
            };
            console.log(`📊 Reporte de fondo ${fondo.nombre}:`, reporteFondo);
            reportesFondos.push(reporteFondo);
            totalIngresosPeriodo += ingresosPeriodo;
            totalGastosPeriodo += gastosPeriodo;
            totalTransacciones += transaccionesPeriodo.length;
        }
        const resumen = {
            totalIngresos: totalIngresosPeriodo,
            totalGastos: totalGastosPeriodo,
            balanceNeto: totalIngresosPeriodo - totalGastosPeriodo,
            transaccionesTotales: totalTransacciones,
        };
        console.log(`✅ Reporte personalizado generado para período ${nombrePeriodo}:`, {
            fondos: reportesFondos.length,
            resumen
        });
        return {
            periodo: nombrePeriodo,
            mes: fechaInicio.getMonth() + 1,
            año: fechaInicio.getFullYear(),
            fondos: reportesFondos,
            resumen,
        };
    }
    async obtenerHistorialTransacciones(fechaInicio, fechaFin, usuarioId) {
        console.log(`📈 [HISTORIAL] Obteniendo transacciones del ${fechaInicio.toLocaleDateString()} al ${fechaFin.toLocaleDateString()}`);
        console.log(`📈 [HISTORIAL] Usuario ID: ${usuarioId}`);
        console.log(`📈 [HISTORIAL] Fechas ISO: ${fechaInicio.toISOString()} - ${fechaFin.toISOString()}`);
        try {
            const transacciones = await this.transaccionModel
                .find({
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
                fecha: { $gte: fechaInicio, $lte: fechaFin }
            })
                .populate({
                path: 'fondoId',
                select: 'nombre tipo',
                strictPopulate: false
            })
                .sort({ fecha: -1 })
                .limit(50)
                .exec();
            console.log(`📈 [HISTORIAL] Transacciones encontradas: ${transacciones.length}`);
            if (transacciones.length > 0) {
                console.log(`📈 [HISTORIAL] Primera transacción: ${transacciones[0].fecha}`);
                console.log(`📈 [HISTORIAL] Última transacción: ${transacciones[transacciones.length - 1].fecha}`);
            }
            const historial = transacciones.map(transaccion => ({
                id: transaccion._id,
                fecha: transaccion.fecha,
                descripcion: transaccion.descripcion,
                monto: transaccion.monto,
                tipo: transaccion.tipo,
                categoria: transaccion.categoria,
                fondo: transaccion.fondoId ?
                    (typeof transaccion.fondoId === 'object' ?
                        transaccion.fondoId.nombre : 'Fondo no encontrado') : 'Sin fondo',
                etiquetas: transaccion.etiquetas || []
            }));
            console.log(`✅ [HISTORIAL] Historial procesado: ${historial.length} transacciones`);
            console.log(`📊 [HISTORIAL] Ejemplo de transacción:`, historial[0] || 'Sin transacciones');
            return historial;
        }
        catch (error) {
            console.error(`❌ [HISTORIAL] Error al obtener historial:`, error);
            console.error(`❌ [HISTORIAL] Parámetros:`, { fechaInicio, fechaFin, usuarioId });
            throw error;
        }
    }
    async calcularBalanceTotal(usuarioId) {
        const transacciones = await this.transaccionModel.find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
        }).exec();
        const totalIngresos = transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO && t.categoria !== 'transferencia')
            .reduce((sum, t) => sum + t.monto, 0);
        const totalGastos = transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO && t.categoria !== 'transferencia')
            .reduce((sum, t) => sum + t.monto, 0);
        return totalIngresos - totalGastos;
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