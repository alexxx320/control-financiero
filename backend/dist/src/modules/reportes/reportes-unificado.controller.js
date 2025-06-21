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
exports.ReportesUnificadoController = void 0;
const common_1 = require("@nestjs/common");
const reportes_unificado_service_1 = require("./reportes-unificado.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ReportesUnificadoController = class ReportesUnificadoController {
    constructor(reportesService) {
        this.reportesService = reportesService;
    }
    async obtenerDashboard(periodo = 'mes', req) {
        console.log(`📊 Obteniendo dashboard unificado - Usuario: ${req.user.id}, Período: ${periodo}`);
        try {
            const usuarioId = req.user.id;
            const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);
            const [reporteBase, kpis, tendenciaMensual, distribucionCategorias, fondosPerformance, flujoCaja, alertas, estadisticas] = await Promise.all([
                this.reportesService.generarReporteBase(usuarioId, fechaInicio, fechaFin),
                this.reportesService.calcularKPIs(usuarioId, fechaInicio, fechaFin),
                this.reportesService.obtenerTendenciaMensual(usuarioId, 6),
                this.reportesService.obtenerDistribucionCategorias(usuarioId, fechaInicio, fechaFin),
                this.reportesService.obtenerPerformanceFondos(usuarioId, fechaInicio, fechaFin),
                this.reportesService.obtenerFlujoCaja(usuarioId, fechaInicio, fechaFin),
                this.reportesService.obtenerAlertasFinancieras(usuarioId),
                this.reportesService.obtenerEstadisticasGenerales(usuarioId)
            ]);
            const dashboardData = {
                periodo: {
                    tipo: periodo,
                    fechaInicio: fechaInicio.toISOString().split('T')[0],
                    fechaFin: fechaFin.toISOString().split('T')[0],
                    descripcion: this.getDescripcionPeriodo(periodo, fechaInicio, fechaFin)
                },
                kpis,
                graficos: {
                    tendenciaMensual,
                    distribucionCategorias: distribucionCategorias.slice(0, 8),
                    fondosPerformance: fondosPerformance.slice(0, 5),
                    flujoCaja: flujoCaja.slice(-30)
                },
                resumen: reporteBase.resumen,
                fondos: reporteBase.fondos,
                alertas: alertas.slice(0, 10),
                estadisticas,
                metadata: {
                    fechaGeneracion: new Date().toISOString(),
                    totalRegistros: reporteBase.fondos.length,
                    hayDatos: reporteBase.fondos.length > 0
                }
            };
            console.log('✅ Dashboard unificado generado exitosamente');
            return dashboardData;
        }
        catch (error) {
            console.error('❌ Error al generar dashboard unificado:', error);
            throw error;
        }
    }
    async obtenerDatosGraficos(tipo = 'tendencia', periodo = 'mes', req) {
        console.log(`📈 Obteniendo datos de gráfico: ${tipo} - Período: ${periodo}`);
        try {
            const usuarioId = req.user.id;
            const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);
            switch (tipo) {
                case 'tendencia':
                    const tendencia = await this.reportesService.obtenerTendenciaMensual(usuarioId, 6);
                    return {
                        type: 'line',
                        data: {
                            labels: tendencia.map(item => item.mes),
                            datasets: [
                                {
                                    label: 'Ingresos',
                                    data: tendencia.map(item => item.ingresos),
                                    borderColor: '#4CAF50',
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                },
                                {
                                    label: 'Gastos',
                                    data: tendencia.map(item => item.gastos),
                                    borderColor: '#F44336',
                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                },
                                {
                                    label: 'Utilidad',
                                    data: tendencia.map(item => item.utilidad),
                                    borderColor: '#2196F3',
                                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                    tension: 0.4,
                                    fill: false
                                }
                            ]
                        }
                    };
                case 'categorias':
                    const categorias = await this.reportesService.obtenerDistribucionCategorias(usuarioId, fechaInicio, fechaFin);
                    return {
                        type: 'pie',
                        data: {
                            labels: categorias.map(item => item.categoria),
                            datasets: [{
                                    data: categorias.map(item => item.monto),
                                    backgroundColor: [
                                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                                    ]
                                }]
                        }
                    };
                case 'flujo':
                    const flujo = await this.reportesService.obtenerFlujoCaja(usuarioId, fechaInicio, fechaFin);
                    return {
                        type: 'bar',
                        data: {
                            labels: flujo.map(item => item.fecha),
                            datasets: [
                                {
                                    label: 'Entradas',
                                    data: flujo.map(item => item.entradas),
                                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                                    borderColor: '#4CAF50',
                                    borderWidth: 1
                                },
                                {
                                    label: 'Salidas',
                                    data: flujo.map(item => -item.salidas),
                                    backgroundColor: 'rgba(244, 67, 54, 0.8)',
                                    borderColor: '#F44336',
                                    borderWidth: 1
                                }
                            ]
                        }
                    };
                case 'fondos':
                    const fondos = await this.reportesService.obtenerPerformanceFondos(usuarioId, fechaInicio, fechaFin);
                    return {
                        type: 'horizontalBar',
                        data: {
                            labels: fondos.map(item => item.nombre),
                            datasets: [{
                                    label: 'Balance Actual',
                                    data: fondos.map(item => item.balanceActual),
                                    backgroundColor: fondos.map(item => item.rendimiento === 'excelente' ? '#4CAF50' :
                                        item.rendimiento === 'bueno' ? '#2196F3' :
                                            item.rendimiento === 'regular' ? '#FF9800' : '#F44336')
                                }]
                        }
                    };
                default:
                    throw new Error(`Tipo de gráfico no soportado: ${tipo}`);
            }
        }
        catch (error) {
            console.error(`❌ Error al obtener datos de gráfico ${tipo}:`, error);
            throw error;
        }
    }
    async obtenerReporte(mes, año, req) {
        console.log(`📋 Obteniendo reporte específico - Mes: ${mes}, Año: ${año}`);
        try {
            const usuarioId = req.user.id;
            const mesNum = parseInt(mes) || new Date().getMonth() + 1;
            const añoNum = parseInt(año) || new Date().getFullYear();
            const fechaInicio = new Date(añoNum, mesNum - 1, 1);
            const fechaFin = new Date(añoNum, mesNum, 0);
            return await this.reportesService.generarReporteBase(usuarioId, fechaInicio, fechaFin);
        }
        catch (error) {
            console.error('❌ Error al obtener reporte específico:', error);
            throw error;
        }
    }
    async obtenerAlertas(req) {
        console.log(`🚨 Obteniendo alertas financieras - Usuario: ${req.user.id}`);
        try {
            const usuarioId = req.user.id;
            const alertas = await this.reportesService.obtenerAlertasFinancieras(usuarioId);
            return {
                alertas,
                total: alertas.length,
                porPrioridad: {
                    alta: alertas.filter(a => a.prioridad === 'ALTA').length,
                    media: alertas.filter(a => a.prioridad === 'MEDIA').length,
                    baja: alertas.filter(a => a.prioridad === 'BAJA').length
                }
            };
        }
        catch (error) {
            console.error('❌ Error al obtener alertas:', error);
            throw error;
        }
    }
    async exportarPDF(filtros, req, res) {
        console.log(`📄 Exportando reporte a PDF - Usuario: ${req.user.id}`);
        try {
            const usuarioId = req.user.id;
            const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(filtros.periodo);
            const [reporteBase, kpis, tendencia] = await Promise.all([
                this.reportesService.generarReporteBase(usuarioId, fechaInicio, fechaFin),
                this.reportesService.calcularKPIs(usuarioId, fechaInicio, fechaFin),
                this.reportesService.obtenerTendenciaMensual(usuarioId, 6)
            ]);
            const pdfBuffer = await this.reportesService.generarPDF({
                reporte: reporteBase,
                kpis,
                tendencia,
                periodo: this.getDescripcionPeriodo(filtros.periodo, fechaInicio, fechaFin),
                usuario: req.user
            });
            const fileName = `reporte-financiero-${fechaInicio.toISOString().split('T')[0]}.pdf`;
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': pdfBuffer.length,
            });
            res.end(pdfBuffer);
        }
        catch (error) {
            console.error('❌ Error al exportar PDF:', error);
            res.status(500).json({
                error: 'Error al generar el reporte PDF',
                message: error.message
            });
        }
    }
    async exportarExcel(filtros, req, res) {
        console.log(`📊 Exportando reporte a Excel - Usuario: ${req.user.id}`);
        try {
            const usuarioId = req.user.id;
            const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(filtros.periodo);
            const [reporteBase, kpis, tendencia, alertas] = await Promise.all([
                this.reportesService.generarReporteBase(usuarioId, fechaInicio, fechaFin),
                this.reportesService.calcularKPIs(usuarioId, fechaInicio, fechaFin),
                this.reportesService.obtenerTendenciaMensual(usuarioId, 12),
                this.reportesService.obtenerAlertasFinancieras(usuarioId)
            ]);
            const excelBuffer = await this.reportesService.generarExcel({
                reporte: reporteBase,
                kpis,
                tendencia,
                alertas,
                periodo: this.getDescripcionPeriodo(filtros.periodo, fechaInicio, fechaFin),
                usuario: req.user
            });
            const fileName = `reporte-financiero-${fechaInicio.toISOString().split('T')[0]}.xlsx`;
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': excelBuffer.length,
            });
            res.end(excelBuffer);
        }
        catch (error) {
            console.error('❌ Error al exportar Excel:', error);
            res.status(500).json({
                error: 'Error al generar el reporte Excel',
                message: error.message
            });
        }
    }
    test() {
        return {
            message: 'Controlador de reportes UNIFICADO funcionando correctamente ✅',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            caracteristicas: [
                'Dashboard unificado con datos reales',
                'Gráficos interactivos con Chart.js',
                'Exportación PDF/Excel funcional',
                'Sistema de alertas integrado',
                'KPIs calculados en tiempo real',
                'Soporte para múltiples períodos'
            ],
            endpoints: [
                'GET /api/reportes/dashboard - Dashboard principal unificado',
                'GET /api/reportes/graficos?tipo=... - Datos específicos para gráficos',
                'GET /api/reportes/reporte/:tipo - Reportes específicos',
                'GET /api/reportes/alertas - Alertas financieras',
                'POST /api/reportes/exportar/pdf - Exportar PDF',
                'POST /api/reportes/exportar/excel - Exportar Excel'
            ]
        };
    }
    calcularFechasPeriodo(periodo) {
        const hoy = new Date();
        let fechaInicio;
        let fechaFin = new Date(hoy);
        switch (periodo) {
            case 'semana':
                fechaInicio = new Date(hoy);
                fechaInicio.setDate(hoy.getDate() - 7);
                break;
            case 'mes':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                break;
            case 'trimestre':
                const quarterStart = Math.floor(hoy.getMonth() / 3) * 3;
                fechaInicio = new Date(hoy.getFullYear(), quarterStart, 1);
                fechaFin = new Date(hoy.getFullYear(), quarterStart + 3, 0);
                break;
            case 'año':
                fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                fechaFin = new Date(hoy.getFullYear(), 11, 31);
                break;
            default:
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        }
        return { fechaInicio, fechaFin };
    }
    getDescripcionPeriodo(periodo, fechaInicio, fechaFin) {
        const formatoFecha = new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        switch (periodo) {
            case 'semana':
                return `Última semana (${formatoFecha.format(fechaInicio)} - ${formatoFecha.format(fechaFin)})`;
            case 'mes':
                return `${fechaInicio.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
            case 'trimestre':
                const trimestre = Math.floor(fechaInicio.getMonth() / 3) + 1;
                return `${trimestre}° Trimestre ${fechaInicio.getFullYear()}`;
            case 'año':
                return `Año ${fechaInicio.getFullYear()}`;
            default:
                return `${formatoFecha.format(fechaInicio)} - ${formatoFecha.format(fechaFin)}`;
        }
    }
};
exports.ReportesUnificadoController = ReportesUnificadoController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('periodo')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportesUnificadoController.prototype, "obtenerDashboard", null);
__decorate([
    (0, common_1.Get)('graficos'),
    __param(0, (0, common_1.Query)('tipo')),
    __param(1, (0, common_1.Query)('periodo')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportesUnificadoController.prototype, "obtenerDatosGraficos", null);
__decorate([
    (0, common_1.Get)('reporte/:tipo'),
    __param(0, (0, common_1.Query)('mes')),
    __param(1, (0, common_1.Query)('año')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportesUnificadoController.prototype, "obtenerReporte", null);
__decorate([
    (0, common_1.Get)('alertas'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportesUnificadoController.prototype, "obtenerAlertas", null);
__decorate([
    (0, common_1.Post)('exportar/pdf'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportesUnificadoController.prototype, "exportarPDF", null);
__decorate([
    (0, common_1.Post)('exportar/excel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportesUnificadoController.prototype, "exportarExcel", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ReportesUnificadoController.prototype, "test", null);
exports.ReportesUnificadoController = ReportesUnificadoController = __decorate([
    (0, common_1.Controller)('api/reportes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reportes_unificado_service_1.ReportesUnificadoService])
], ReportesUnificadoController);
//# sourceMappingURL=reportes-unificado.controller.js.map