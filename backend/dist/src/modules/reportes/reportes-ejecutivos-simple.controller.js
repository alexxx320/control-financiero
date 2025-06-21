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
exports.ReportesEjecutivosController = void 0;
const common_1 = require("@nestjs/common");
const reportes_service_1 = require("./reportes.service");
let ReportesEjecutivosController = class ReportesEjecutivosController {
    constructor(reportesService) {
        this.reportesService = reportesService;
    }
    async obtenerDashboard(periodo = 'mes') {
        try {
            console.log(`📊 Generando dashboard para período: ${periodo}`);
            const dashboardData = {
                kpis: {
                    totalIngresos: Math.floor(Math.random() * 5000000) + 2000000,
                    totalGastos: Math.floor(Math.random() * 3000000) + 1000000,
                    utilidadNeta: 0,
                    margenUtilidad: 0,
                    fondosActivos: 3,
                    transaccionesPromedio: Math.floor(Math.random() * 10) + 5
                },
                tendenciaMensual: [
                    { mes: 'Enero', ingresos: 2500000, gastos: 1800000, utilidad: 700000 },
                    { mes: 'Febrero', ingresos: 2200000, gastos: 1600000, utilidad: 600000 },
                    { mes: 'Marzo', ingresos: 2800000, gastos: 2000000, utilidad: 800000 },
                    { mes: 'Abril', ingresos: 3000000, gastos: 2200000, utilidad: 800000 },
                    { mes: 'Mayo', ingresos: 2700000, gastos: 1900000, utilidad: 800000 },
                    { mes: 'Junio', ingresos: 3200000, gastos: 2400000, utilidad: 800000 }
                ],
                flujoCaja: [
                    { fecha: '2024-06-01', entradas: 500000, salidas: 300000 },
                    { fecha: '2024-06-08', entradas: 600000, salidas: 400000 },
                    { fecha: '2024-06-15', entradas: 450000, salidas: 350000 },
                    { fecha: '2024-06-22', entradas: 700000, salidas: 500000 }
                ],
                fondosPerformance: [
                    {
                        nombre: 'Fondo Principal',
                        tipo: 'ahorro',
                        saldoActual: 2500000,
                        progresoMeta: 75.5,
                        rendimiento: 'bueno'
                    },
                    {
                        nombre: 'Fondo Emergencia',
                        tipo: 'emergencia',
                        saldoActual: 1200000,
                        progresoMeta: 60.0,
                        rendimiento: 'regular'
                    },
                    {
                        nombre: 'Fondo Inversión',
                        tipo: 'inversion',
                        saldoActual: 800000,
                        progresoMeta: 40.0,
                        rendimiento: 'excelente'
                    }
                ]
            };
            dashboardData.kpis.utilidadNeta = dashboardData.kpis.totalIngresos - dashboardData.kpis.totalGastos;
            dashboardData.kpis.margenUtilidad = dashboardData.kpis.totalIngresos > 0
                ? (dashboardData.kpis.utilidadNeta / dashboardData.kpis.totalIngresos) * 100
                : 0;
            console.log('✅ Dashboard generado exitosamente');
            return dashboardData;
        }
        catch (error) {
            console.error('❌ Error al generar dashboard:', error);
            throw new Error('Error interno del servidor');
        }
    }
    async obtenerKPIs(periodo = 'mes') {
        try {
            const kpis = {
                totalIngresos: Math.floor(Math.random() * 5000000) + 2000000,
                totalGastos: Math.floor(Math.random() * 3000000) + 1000000,
                utilidadNeta: 0,
                margenUtilidad: 0,
                fondosActivos: 3,
                transaccionesPromedio: Math.floor(Math.random() * 10) + 5,
                periodo: periodo
            };
            kpis.utilidadNeta = kpis.totalIngresos - kpis.totalGastos;
            kpis.margenUtilidad = kpis.totalIngresos > 0 ? (kpis.utilidadNeta / kpis.totalIngresos) * 100 : 0;
            return kpis;
        }
        catch (error) {
            console.error('❌ Error al obtener KPIs:', error);
            throw new Error('Error interno del servidor');
        }
    }
    async obtenerDatosGraficos(periodo = 'mes', tipo = 'tendencia') {
        try {
            if (tipo === 'tendencia') {
                return {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: [2500000, 2200000, 2800000, 3000000, 2700000, 3200000],
                            borderColor: '#27ae60',
                            backgroundColor: 'rgba(39, 174, 96, 0.1)'
                        },
                        {
                            label: 'Gastos',
                            data: [1800000, 1600000, 2000000, 2200000, 1900000, 2400000],
                            borderColor: '#e74c3c',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)'
                        }
                    ]
                };
            }
            return { message: 'Tipo de gráfico no implementado' };
        }
        catch (error) {
            console.error('❌ Error al obtener datos de gráficos:', error);
            throw new Error('Error interno del servidor');
        }
    }
    async exportarPDF(body, res) {
        try {
            const { periodo = 'mes' } = body;
            const pdfBuffer = Buffer.from('PDF simulado', 'utf-8');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=reporte-${periodo}-${new Date().toISOString().split('T')[0]}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('❌ Error al exportar PDF:', error);
            res.status(500).json({ error: 'Error al generar PDF' });
        }
    }
    async exportarExcel(body, res) {
        try {
            const { periodo = 'mes' } = body;
            const excelBuffer = Buffer.from('Excel simulado', 'utf-8');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=reporte-${periodo}-${new Date().toISOString().split('T')[0]}.xlsx`);
            res.send(excelBuffer);
        }
        catch (error) {
            console.error('❌ Error al exportar Excel:', error);
            res.status(500).json({ error: 'Error al generar Excel' });
        }
    }
    test() {
        return {
            message: 'Controlador de reportes ejecutivos funcionando correctamente ✅',
            timestamp: new Date().toISOString(),
            endpoints: [
                'GET /api/reportes/ejecutivos/dashboard',
                'GET /api/reportes/ejecutivos/kpis',
                'GET /api/reportes/ejecutivos/graficos',
                'POST /api/reportes/ejecutivos/exportar/pdf',
                'POST /api/reportes/ejecutivos/exportar/excel'
            ]
        };
    }
};
exports.ReportesEjecutivosController = ReportesEjecutivosController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('periodo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "obtenerDashboard", null);
__decorate([
    (0, common_1.Get)('kpis'),
    __param(0, (0, common_1.Query)('periodo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "obtenerKPIs", null);
__decorate([
    (0, common_1.Get)('graficos'),
    __param(0, (0, common_1.Query)('periodo')),
    __param(1, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "obtenerDatosGraficos", null);
__decorate([
    (0, common_1.Post)('exportar/pdf'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "exportarPDF", null);
__decorate([
    (0, common_1.Post)('exportar/excel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "exportarExcel", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ReportesEjecutivosController.prototype, "test", null);
exports.ReportesEjecutivosController = ReportesEjecutivosController = __decorate([
    (0, common_1.Controller)('reportes/ejecutivos'),
    __metadata("design:paramtypes", [reportes_service_1.ReportesService])
], ReportesEjecutivosController);
//# sourceMappingURL=reportes-ejecutivos-simple.controller.js.map