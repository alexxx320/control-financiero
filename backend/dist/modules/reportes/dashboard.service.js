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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fondo_schema_1 = require("../fondos/schemas/fondo.schema");
const transaccion_schema_1 = require("../transacciones/schemas/transaccion.schema");
let DashboardService = class DashboardService {
    constructor(fondoModel, transaccionModel) {
        this.fondoModel = fondoModel;
        this.transaccionModel = transaccionModel;
    }
    async obtenerResumenFinanciero(usuarioId, fechaInicio, fechaFin) {
        console.log('📊 DashboardService - Obteniendo resumen financiero para usuario:', usuarioId);
        const filtroFecha = {};
        if (fechaInicio || fechaFin) {
            filtroFecha.fecha = {};
            if (fechaInicio)
                filtroFecha.fecha.$gte = new Date(fechaInicio);
            if (fechaFin)
                filtroFecha.fecha.$lte = new Date(fechaFin);
        }
        const transacciones = await this.transaccionModel
            .find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            ...filtroFecha
        })
            .populate('fondoId', 'nombre tipo')
            .exec();
        console.log(`📊 Transacciones encontradas para usuario ${usuarioId}:`, transacciones.length);
        const totalIngresos = transacciones
            .filter(t => t.tipo === 'ingreso' && t.categoria !== 'transferencia')
            .reduce((sum, t) => sum + t.monto, 0);
        const totalGastos = transacciones
            .filter(t => t.tipo === 'gasto' && t.categoria !== 'transferencia')
            .reduce((sum, t) => sum + t.monto, 0);
        const balance = totalIngresos - totalGastos;
        const totalTransferencias = transacciones
            .filter(t => t.categoria === 'transferencia')
            .length;
        console.log('📊 Resumen financiero (sin transferencias en totales):', {
            totalIngresos,
            totalGastos,
            balance,
            totalTransferencias
        });
        const fondos = await this.fondoModel
            .find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        })
            .exec();
        const fondosPorTipo = this.procesarFondosPorTipo(fondos, transacciones);
        const transaccionesPorCategoria = this.procesarTransaccionesPorCategoria(transacciones);
        const resultado = {
            totalIngresos,
            totalGastos,
            balance,
            totalTransferencias,
            fondosPorTipo,
            transaccionesPorCategoria,
            tendenciaMensual: []
        };
        console.log('✅ DashboardService - Resumen financiero calculado:', resultado);
        return resultado;
    }
    async obtenerEstadisticas(usuarioId, fechaInicio, fechaFin) {
        console.log('📈 DashboardService - Obteniendo estadísticas para usuario:', usuarioId);
        const fondos = await this.fondoModel
            .find({ usuarioId: new mongoose_2.Types.ObjectId(usuarioId) })
            .exec();
        const fondosActivos = fondos.filter(f => f.activo);
        const filtroBase = { usuarioId: new mongoose_2.Types.ObjectId(usuarioId) };
        const todasLasTransacciones = await this.transaccionModel
            .find(filtroBase)
            .exec();
        const filtroFecha = { ...filtroBase };
        if (fechaInicio || fechaFin) {
            filtroFecha.fecha = {};
            if (fechaInicio)
                filtroFecha.fecha.$gte = new Date(fechaInicio);
            if (fechaFin)
                filtroFecha.fecha.$lte = new Date(fechaFin);
        }
        const transaccionesFiltradas = await this.transaccionModel
            .find(filtroFecha)
            .exec();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);
        const transaccionesHoy = todasLasTransacciones.filter(t => t.fecha >= hoy && t.fecha < mañana).length;
        const transaccionesMes = transaccionesFiltradas.length;
        const gastosFiltrados = transaccionesFiltradas.filter(t => t.tipo === 'gasto' && t.categoria !== 'transferencia');
        const mayorGasto = gastosFiltrados.length > 0
            ? Math.max(...gastosFiltrados.map(t => t.monto))
            : 0;
        const ingresosFiltrados = transaccionesFiltradas.filter(t => t.tipo === 'ingreso' && t.categoria !== 'transferencia');
        const mayorIngreso = ingresosFiltrados.length > 0
            ? Math.max(...ingresosFiltrados.map(t => t.monto))
            : 0;
        const resultado = {
            totalFondos: fondos.length,
            fondosActivos: fondosActivos.length,
            transaccionesHoy,
            transaccionesMes,
            mayorGasto,
            mayorIngreso
        };
        console.log('✅ DashboardService - Estadísticas calculadas:', resultado);
        return resultado;
    }
    async obtenerDatosGrafico(usuarioId, fechaInicio, fechaFin) {
        console.log('📈 DashboardService - Obteniendo datos para gráfico:', usuarioId);
        const filtroFecha = { usuarioId: new mongoose_2.Types.ObjectId(usuarioId) };
        if (fechaInicio || fechaFin) {
            filtroFecha.fecha = {};
            if (fechaInicio)
                filtroFecha.fecha.$gte = new Date(fechaInicio);
            if (fechaFin)
                filtroFecha.fecha.$lte = new Date(fechaFin);
        }
        const transacciones = await this.transaccionModel
            .find(filtroFecha)
            .sort({ fecha: 1 })
            .exec();
        console.log(`📈 Transacciones para gráfico:`, transacciones.length);
        const periodo = this.determinarPeriodoAgrupacion(fechaInicio, fechaFin);
        console.log(`📈 Período de agrupación:`, periodo);
        const datosAgrupados = this.agruparTransaccionesPorPeriodo(transacciones, periodo);
        const resultado = {
            labels: datosAgrupados.map(d => d.label),
            ingresos: datosAgrupados.map(d => d.ingresos),
            gastos: datosAgrupados.map(d => d.gastos),
            periodo
        };
        console.log('✅ DashboardService - Datos de gráfico calculados:', resultado);
        return resultado;
    }
    determinarPeriodoAgrupacion(fechaInicio, fechaFin) {
        if (!fechaInicio || !fechaFin) {
            return 'mes';
        }
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diffMs = fin.getTime() - inicio.getTime();
        const diffDias = diffMs / (1000 * 60 * 60 * 24);
        if (diffDias <= 1) {
            return 'hora';
        }
        else if (diffDias <= 7) {
            return 'dia';
        }
        else if (diffDias <= 31) {
            return 'semana';
        }
        else {
            return 'mes';
        }
    }
    agruparTransaccionesPorPeriodo(transacciones, periodo) {
        const grupos = new Map();
        transacciones.forEach(transaccion => {
            const fecha = new Date(transaccion.fecha);
            let clave;
            switch (periodo) {
                case 'hora':
                    clave = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}-${fecha.getHours()}`;
                    break;
                case 'dia':
                    clave = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;
                    break;
                case 'semana':
                    const inicioSemana = new Date(fecha);
                    inicioSemana.setDate(fecha.getDate() - fecha.getDay());
                    clave = `${inicioSemana.getFullYear()}-${inicioSemana.getMonth()}-${inicioSemana.getDate()}`;
                    break;
                case 'mes':
                    clave = `${fecha.getFullYear()}-${fecha.getMonth()}`;
                    break;
            }
            if (!grupos.has(clave)) {
                grupos.set(clave, {
                    fecha: fecha,
                    ingresos: 0,
                    gastos: 0,
                    label: this.generarLabelPeriodo(fecha, periodo)
                });
            }
            const grupo = grupos.get(clave);
            if (transaccion.categoria !== 'transferencia') {
                if (transaccion.tipo === 'ingreso') {
                    grupo.ingresos += transaccion.monto;
                }
                else if (transaccion.tipo === 'gasto') {
                    grupo.gastos += transaccion.monto;
                }
            }
        });
        const resultado = Array.from(grupos.values())
            .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        return resultado;
    }
    generarLabelPeriodo(fecha, periodo) {
        switch (periodo) {
            case 'hora':
                return fecha.getHours().toString().padStart(2, '0') + ':00';
            case 'dia':
                return fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
            case 'semana':
                const inicioSemana = new Date(fecha);
                inicioSemana.setDate(fecha.getDate() - fecha.getDay());
                return `${inicioSemana.getDate()}/${inicioSemana.getMonth() + 1}`;
            case 'mes':
                return fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            default:
                return fecha.toLocaleDateString('es-ES');
        }
    }
    async verificarConectividad() {
        try {
            await this.fondoModel.findOne().limit(1).exec();
            return true;
        }
        catch (error) {
            console.error('❌ Error de conectividad:', error);
            return false;
        }
    }
    procesarFondosPorTipo(fondos, transacciones) {
        const tiposMap = new Map();
        fondos.forEach(fondo => {
            const tipo = fondo.tipo;
            if (!tiposMap.has(tipo)) {
                tiposMap.set(tipo, {
                    tipo,
                    cantidad: 0,
                    montoTotal: 0,
                    progreso: 0
                });
            }
            const tipoData = tiposMap.get(tipo);
            tipoData.cantidad += 1;
            tipoData.montoTotal += fondo.saldoActual || 0;
        });
        tiposMap.forEach((value) => {
            if (value.montoTotal > 0) {
                value.progreso = Math.min((value.montoTotal / (value.cantidad * 500000)) * 100, 100);
            }
        });
        return Array.from(tiposMap.values());
    }
    procesarTransaccionesPorCategoria(transacciones) {
        const categoriasMap = new Map();
        transacciones.forEach(t => {
            const categoria = t.categoria;
            if (!categoriasMap.has(categoria)) {
                categoriasMap.set(categoria, {
                    categoria,
                    cantidad: 0,
                    monto: 0,
                    tipo: t.tipo
                });
            }
            const categoriaData = categoriasMap.get(categoria);
            categoriaData.cantidad += 1;
            categoriaData.monto += t.monto;
        });
        return Array.from(categoriasMap.values())
            .sort((a, b) => b.monto - a.monto);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(fondo_schema_1.Fondo.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaccion_schema_1.Transaccion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map