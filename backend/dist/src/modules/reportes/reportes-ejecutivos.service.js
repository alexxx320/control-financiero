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
exports.ReportesEjecutivosService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const fondo_schema_1 = require("../fondos/schemas/fondo.schema");
const transaccion_schema_1 = require("../transacciones/schemas/transaccion.schema");
const financiero_interface_1 = require("../../common/interfaces/financiero.interface");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
let ReportesEjecutivosService = class ReportesEjecutivosService {
    constructor(fondoModel, transaccionModel) {
        this.fondoModel = fondoModel;
        this.transaccionModel = transaccionModel;
    }
    async generarReporteEjecutivo(usuarioId, fechaInicio, fechaFin) {
        console.log(`📊 Generando reporte ejecutivo para usuario ${usuarioId}`);
        const [fondos, transacciones] = await Promise.all([
            this.obtenerFondosUsuario(usuarioId),
            this.obtenerTransacciones(usuarioId, fechaInicio, fechaFin)
        ]);
        const kpis = await this.calcularKPIs(usuarioId, transacciones, fondos);
        const tendenciaMensual = await this.generarTendenciaMensual(usuarioId, fechaInicio, fechaFin);
        const distribucionCategorias = this.analizarDistribucionCategorias(transacciones);
        const fondosPerformance = await this.evaluarPerformanceFondos(usuarioId, fondos);
        const flujoCaja = await this.calcularFlujoCaja(usuarioId, fechaInicio, fechaFin);
        return {
            periodo: {
                inicio: fechaInicio,
                fin: fechaFin,
                descripcion: `${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}`
            },
            kpis,
            tendenciaMensual,
            distribucionCategorias,
            fondosPerformance,
            flujoCaja
        };
    }
    async exportarPDF(reporteEjecutivo) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });
                doc.fontSize(24)
                    .fillColor('#1565C0')
                    .text('REPORTE EJECUTIVO FINANCIERO', { align: 'center' });
                doc.moveDown();
                doc.fontSize(14)
                    .fillColor('#666666')
                    .text(`Período: ${reporteEjecutivo.periodo.descripcion}`, { align: 'center' });
                doc.moveDown(2);
                doc.fontSize(18)
                    .fillColor('#333333')
                    .text('INDICADORES CLAVE (KPIs)', { underline: true });
                doc.moveDown();
                const kpis = reporteEjecutivo.kpis;
                doc.fontSize(12);
                const startY = doc.y;
                const colWidth = 250;
                doc.text(`Total Ingresos: $${kpis.totalIngresos.toLocaleString('es-CO')}`, 50, startY);
                doc.text(`Total Gastos: $${kpis.totalGastos.toLocaleString('es-CO')}`, 50 + colWidth, startY);
                doc.text(`Utilidad Neta: $${kpis.utilidadNeta.toLocaleString('es-CO')}`, 50, startY + 20);
                doc.text(`Margen Utilidad: ${kpis.margenUtilidad.toFixed(1)}%`, 50 + colWidth, startY + 20);
                doc.text(`Crecimiento: ${kpis.crecimiento.toFixed(1)}%`, 50, startY + 40);
                doc.text(`Fondos Activos: ${kpis.fondosActivos}`, 50 + colWidth, startY + 40);
                doc.y = startY + 80;
                doc.moveDown(2);
                doc.fontSize(16)
                    .text('PERFORMANCE DE FONDOS', { underline: true });
                doc.moveDown();
                doc.fontSize(11);
                doc.text('Fondo', 50, doc.y, { width: 150 });
                doc.text('Saldo Actual', 200, doc.y, { width: 100 });
                doc.text('Progreso Meta', 300, doc.y, { width: 80 });
                doc.text('Rendimiento', 380, doc.y, { width: 80 });
                doc.moveDown(0.5);
                doc.moveTo(50, doc.y)
                    .lineTo(500, doc.y)
                    .stroke();
                doc.moveDown(0.5);
                reporteEjecutivo.fondosPerformance.forEach((fondo) => {
                    const y = doc.y;
                    doc.text(fondo.nombre, 50, y, { width: 150 });
                    doc.text(`$${fondo.saldoActual.toLocaleString('es-CO')}`, 200, y, { width: 100 });
                    doc.text(`${fondo.progresoMeta.toFixed(1)}%`, 300, y, { width: 80 });
                    doc.text(fondo.rendimiento.toUpperCase(), 380, y, { width: 80 });
                    doc.moveDown(0.5);
                });
                doc.moveDown(2);
                doc.fontSize(16)
                    .text('TENDENCIA MENSUAL', { underline: true });
                doc.moveDown();
                doc.fontSize(10);
                doc.text('Mes', 50, doc.y, { width: 80 });
                doc.text('Ingresos', 130, doc.y, { width: 100 });
                doc.text('Gastos', 230, doc.y, { width: 100 });
                doc.text('Utilidad', 330, doc.y, { width: 100 });
                doc.text('Transacciones', 430, doc.y, { width: 70 });
                doc.moveDown(0.5);
                doc.moveTo(50, doc.y)
                    .lineTo(500, doc.y)
                    .stroke();
                doc.moveDown(0.5);
                reporteEjecutivo.tendenciaMensual.forEach((mes) => {
                    const y = doc.y;
                    doc.text(mes.mes, 50, y, { width: 80 });
                    doc.text(`$${mes.ingresos.toLocaleString('es-CO')}`, 130, y, { width: 100 });
                    doc.text(`$${mes.gastos.toLocaleString('es-CO')}`, 230, y, { width: 100 });
                    doc.text(`$${mes.utilidad.toLocaleString('es-CO')}`, 330, y, { width: 100 });
                    doc.text(mes.transacciones.toString(), 430, y, { width: 70 });
                    doc.moveDown(0.5);
                });
                doc.fontSize(8)
                    .fillColor('#999999')
                    .text(`Generado el ${new Date().toLocaleDateString('es-ES')} | Sistema de Control Financiero`, 50, doc.page.height - 50, { align: 'center' });
                doc.end();
            }
            catch (error) {
                console.error('Error generando PDF:', error);
                reject(error);
            }
        });
    }
    async exportarExcel(reporteEjecutivo) {
        const workbook = new ExcelJS.Workbook();
        const kpisSheet = workbook.addWorksheet('KPIs');
        kpisSheet.addRow(['INDICADORES CLAVE DE RENDIMIENTO']);
        kpisSheet.addRow(['Período', reporteEjecutivo.periodo.descripcion]);
        kpisSheet.addRow([]);
        kpisSheet.addRow(['Métrica', 'Valor']);
        kpisSheet.addRow(['Total Ingresos', reporteEjecutivo.kpis.totalIngresos]);
        kpisSheet.addRow(['Total Gastos', reporteEjecutivo.kpis.totalGastos]);
        kpisSheet.addRow(['Utilidad Neta', reporteEjecutivo.kpis.utilidadNeta]);
        kpisSheet.addRow(['Margen Utilidad (%)', reporteEjecutivo.kpis.margenUtilidad]);
        kpisSheet.addRow(['Crecimiento (%)', reporteEjecutivo.kpis.crecimiento]);
        kpisSheet.addRow(['Fondos Activos', reporteEjecutivo.kpis.fondosActivos]);
        kpisSheet.getCell('A1').font = { bold: true, size: 16 };
        kpisSheet.getCell('A4').font = { bold: true };
        kpisSheet.getCell('B4').font = { bold: true };
        const tendenciaSheet = workbook.addWorksheet('Tendencia Mensual');
        tendenciaSheet.addRow(['TENDENCIA MENSUAL']);
        tendenciaSheet.addRow([]);
        tendenciaSheet.addRow(['Mes', 'Ingresos', 'Gastos', 'Utilidad', 'Transacciones']);
        reporteEjecutivo.tendenciaMensual.forEach(mes => {
            tendenciaSheet.addRow([mes.mes, mes.ingresos, mes.gastos, mes.utilidad, mes.transacciones]);
        });
        tendenciaSheet.getCell('A1').font = { bold: true, size: 16 };
        ['A3', 'B3', 'C3', 'D3', 'E3'].forEach(cell => {
            tendenciaSheet.getCell(cell).font = { bold: true };
        });
        const fondosSheet = workbook.addWorksheet('Performance Fondos');
        fondosSheet.addRow(['PERFORMANCE DE FONDOS']);
        fondosSheet.addRow([]);
        fondosSheet.addRow(['Fondo', 'Tipo', 'Saldo Actual', 'Meta Ahorro', 'Progreso (%)', 'Rendimiento']);
        reporteEjecutivo.fondosPerformance.forEach(fondo => {
            fondosSheet.addRow([
                fondo.nombre,
                fondo.tipo,
                fondo.saldoActual,
                fondo.metaAhorro,
                fondo.progresoMeta,
                fondo.rendimiento
            ]);
        });
        fondosSheet.getCell('A1').font = { bold: true, size: 16 };
        ['A3', 'B3', 'C3', 'D3', 'E3', 'F3'].forEach(cell => {
            fondosSheet.getCell(cell).font = { bold: true };
        });
        const categoriasSheet = workbook.addWorksheet('Categorías');
        categoriasSheet.addRow(['DISTRIBUCIÓN POR CATEGORÍAS']);
        categoriasSheet.addRow([]);
        categoriasSheet.addRow(['Categoría', 'Tipo', 'Monto', 'Porcentaje (%)', 'Transacciones']);
        reporteEjecutivo.distribucionCategorias.forEach(cat => {
            categoriasSheet.addRow([
                cat.categoria,
                cat.tipo,
                cat.monto,
                cat.porcentaje,
                cat.transacciones
            ]);
        });
        categoriasSheet.getCell('A1').font = { bold: true, size: 16 };
        ['A3', 'B3', 'C3', 'D3', 'E3'].forEach(cell => {
            categoriasSheet.getCell(cell).font = { bold: true };
        });
        const flujoSheet = workbook.addWorksheet('Flujo de Caja');
        flujoSheet.addRow(['FLUJO DE CAJA']);
        flujoSheet.addRow([]);
        flujoSheet.addRow(['Fecha', 'Entradas', 'Salidas', 'Neto', 'Acumulado']);
        reporteEjecutivo.flujoCaja.forEach(flujo => {
            flujoSheet.addRow([flujo.fecha, flujo.entradas, flujo.salidas, flujo.neto, flujo.acumulado]);
        });
        flujoSheet.getCell('A1').font = { bold: true, size: 16 };
        ['A3', 'B3', 'C3', 'D3', 'E3'].forEach(cell => {
            flujoSheet.getCell(cell).font = { bold: true };
        });
        [kpisSheet, tendenciaSheet, fondosSheet, categoriasSheet, flujoSheet].forEach(sheet => {
            sheet.columns.forEach(column => {
                column.width = 15;
            });
        });
        return await workbook.xlsx.writeBuffer();
    }
    async obtenerFondosUsuario(usuarioId) {
        return this.fondoModel.find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            activo: true
        }).exec();
    }
    async obtenerTransacciones(usuarioId, fechaInicio, fechaFin) {
        return this.transaccionModel.find({
            usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
            fecha: { $gte: fechaInicio, $lte: fechaFin }
        }).exec();
    }
    async calcularKPIs(usuarioId, transacciones, fondos) {
        const totalIngresos = transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO)
            .reduce((sum, t) => sum + t.monto, 0);
        const totalGastos = transacciones
            .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO)
            .reduce((sum, t) => sum + t.monto, 0);
        const utilidadNeta = totalIngresos - totalGastos;
        const margenUtilidad = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;
        const crecimiento = 5.2;
        return {
            totalIngresos,
            totalGastos,
            utilidadNeta,
            margenUtilidad,
            crecimiento,
            fondosActivos: fondos.length,
            transaccionesPromedio: transacciones.length / 30
        };
    }
    async generarTendenciaMensual(usuarioId, fechaInicio, fechaFin) {
        const meses = [];
        const fechaActual = new Date(fechaInicio);
        while (fechaActual <= fechaFin) {
            const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
            const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
            const transaccionesMes = await this.transaccionModel.find({
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
                fecha: { $gte: inicioMes, $lte: finMes }
            }).exec();
            const ingresos = transaccionesMes
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO)
                .reduce((sum, t) => sum + t.monto, 0);
            const gastos = transaccionesMes
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO)
                .reduce((sum, t) => sum + t.monto, 0);
            const nombreMes = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            meses.push({
                mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
                ingresos,
                gastos,
                utilidad: ingresos - gastos,
                transacciones: transaccionesMes.length
            });
            fechaActual.setMonth(fechaActual.getMonth() + 1);
        }
        return meses;
    }
    analizarDistribucionCategorias(transacciones) {
        const categorias = new Map();
        const totalMonto = transacciones.reduce((sum, t) => sum + t.monto, 0);
        transacciones.forEach(t => {
            const key = `${t.categoria}-${t.tipo}`;
            if (!categorias.has(key)) {
                categorias.set(key, {
                    categoria: this.formatearCategoria(t.categoria),
                    tipo: t.tipo,
                    monto: 0,
                    transacciones: 0
                });
            }
            const cat = categorias.get(key);
            cat.monto += t.monto;
            cat.transacciones += 1;
        });
        return Array.from(categorias.values()).map(cat => ({
            ...cat,
            porcentaje: totalMonto > 0 ? (cat.monto / totalMonto) * 100 : 0
        })).sort((a, b) => b.monto - a.monto);
    }
    async evaluarPerformanceFondos(usuarioId, fondos) {
        const performance = [];
        for (const fondo of fondos) {
            const transacciones = await this.transaccionModel.find({
                fondoId: fondo._id,
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId)
            }).exec();
            const saldoActual = fondo.saldoActual || 0;
            const metaAhorro = fondo.metaAhorro || 0;
            const progresoMeta = metaAhorro > 0 ? (saldoActual / metaAhorro) * 100 : 0;
            let rendimiento;
            if (progresoMeta >= 90)
                rendimiento = 'excelente';
            else if (progresoMeta >= 70)
                rendimiento = 'bueno';
            else if (progresoMeta >= 40)
                rendimiento = 'regular';
            else
                rendimiento = 'malo';
            performance.push({
                nombre: fondo.nombre,
                tipo: this.formatearTipoFondo(fondo.tipo),
                saldoActual,
                metaAhorro,
                progresoMeta,
                transacciones: transacciones.length,
                rendimiento
            });
        }
        return performance.sort((a, b) => b.saldoActual - a.saldoActual);
    }
    async calcularFlujoCaja(usuarioId, fechaInicio, fechaFin) {
        const flujo = [];
        const fechaActual = new Date(fechaInicio);
        let acumulado = 0;
        while (fechaActual <= fechaFin && flujo.length < 30) {
            const finDia = new Date(fechaActual);
            finDia.setHours(23, 59, 59, 999);
            const transaccionesDia = await this.transaccionModel.find({
                usuarioId: new mongoose_2.Types.ObjectId(usuarioId),
                fecha: { $gte: fechaActual, $lte: finDia }
            }).exec();
            const entradas = transaccionesDia
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.INGRESO)
                .reduce((sum, t) => sum + t.monto, 0);
            const salidas = transaccionesDia
                .filter(t => t.tipo === financiero_interface_1.TipoTransaccion.GASTO)
                .reduce((sum, t) => sum + t.monto, 0);
            const neto = entradas - salidas;
            acumulado += neto;
            if (entradas > 0 || salidas > 0) {
                flujo.push({
                    fecha: fechaActual.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
                    entradas,
                    salidas,
                    neto,
                    acumulado
                });
            }
            fechaActual.setDate(fechaActual.getDate() + 1);
        }
        return flujo;
    }
    formatearCategoria(categoria) {
        const categorias = {
            'alimentacion': 'Alimentación',
            'transporte': 'Transporte',
            'entretenimiento': 'Entretenimiento',
            'salud': 'Salud',
            'educacion': 'Educación',
            'hogar': 'Hogar',
            'ropa': 'Ropa',
            'tecnologia': 'Tecnología',
            'viajes': 'Viajes',
            'salario': 'Salario',
            'freelance': 'Freelance',
            'inversiones': 'Inversiones',
            'regalos': 'Regalos',
            'otros': 'Otros'
        };
        return categorias[categoria?.toLowerCase()] || categoria || 'Otros';
    }
    formatearTipoFondo(tipo) {
        const tipos = {
            'ahorro': 'Ahorro',
            'inversion': 'Inversión',
            'emergencia': 'Emergencia',
            'gastos': 'Gastos',
            'personal': 'Personal'
        };
        return tipos[tipo?.toLowerCase()] || tipo || 'Personal';
    }
};
exports.ReportesEjecutivosService = ReportesEjecutivosService;
exports.ReportesEjecutivosService = ReportesEjecutivosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(fondo_schema_1.Fondo.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaccion_schema_1.Transaccion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ReportesEjecutivosService);
//# sourceMappingURL=reportes-ejecutivos.service.js.map