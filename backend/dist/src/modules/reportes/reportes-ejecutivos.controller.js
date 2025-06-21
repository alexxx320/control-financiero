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
const reportes_ejecutivos_service_1 = require("./reportes-ejecutivos.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ReportesEjecutivosController = class ReportesEjecutivosController {
    constructor(reportesEjecutivosService) {
        this.reportesEjecutivosService = reportesEjecutivosService;
    }
    async obtenerDashboardData(periodo = 'mes', req) {
        console.log(`📊 Obteniendo datos de dashboard ejecutivo - período: ${periodo}`);
        const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);
        const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(req.user.userId, fechaInicio, fechaFin);
        return {
            kpis: reporte.kpis,
            tendenciaMensual: reporte.tendenciaMensual,
            distribucionCategorias: reporte.distribucionCategorias.slice(0, 8),
            fondosPerformance: reporte.fondosPerformance.slice(0, 5),
            flujoCaja: reporte.flujoCaja.slice(-14),
            periodo: reporte.periodo
        };
    }
    async exportarPDF(request, req, res) {
        console.log(`📄 Exportando reporte a PDF para usuario ${req.user.userId}`);
        try {
            const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(request.periodo);
            const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(req.user.userId, fechaInicio, fechaFin);
            const pdfBuffer = await this.reportesEjecutivosService.exportarPDF(reporte);
            const fileName = `reporte-ejecutivo-${fechaInicio.toISOString().split('T')[0]}-${fechaFin.toISOString().split('T')[0]}.pdf`;
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
    async exportarExcel(request, req, res) {
        console.log(`📊 Exportando reporte a Excel para usuario ${req.user.userId}`);
        try {
            const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(request.periodo);
            const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(req.user.userId, fechaInicio, fechaFin);
            const excelBuffer = await this.reportesEjecutivosService.exportarExcel(reporte);
            const fileName = `reporte-ejecutivo-${fechaInicio.toISOString().split('T')[0]}-${fechaFin.toISOString().split('T')[0]}.xlsx`;
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
    async obtenerKPIs(periodo = 'mes', req) {
        console.log(`📈 Obteniendo KPIs ejecutivos - período: ${periodo}`);
        const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);
        const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(req.user.userId, fechaInicio, fechaFin);
        return {
            kpis: reporte.kpis,
            periodo: reporte.periodo.descripcion
        };
    }
    async obtenerDatosGraficos(periodo = 'mes', tipo = 'tendencia', req) {
        console.log(`📊 Obteniendo datos para gráficos: ${tipo} - período: ${periodo}`);
        const { fechaInicio, fechaFin } = this.calcularFechasPeriodo(periodo);
        const reporte = await this.reportesEjecutivosService.generarReporteEjecutivo(req.user.userId, fechaInicio, fechaFin);
        switch (tipo) {
            case 'tendencia':
                return {
                    data: reporte.tendenciaMensual,
                    tipo: 'line'
                };
            case 'categorias':
                return {
                    data: reporte.distribucionCategorias,
                    tipo: 'pie'
                };
            case 'fondos':
                return {
                    data: reporte.fondosPerformance,
                    tipo: 'bar'
                };
            case 'flujo':
                return {
                    data: reporte.flujoCaja,
                    tipo: 'area'
                };
            default:
                return {
                    data: reporte.tendenciaMensual,
                    tipo: 'line'
                };
        }
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
                break;
            case 'trimestre':
                const quarterStart = Math.floor(hoy.getMonth() / 3) * 3;
                fechaInicio = new Date(hoy.getFullYear(), quarterStart, 1);
                break;
            case 'año':
                fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                break;
            default:
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        }
        return { fechaInicio, fechaFin };
    }
};
exports.ReportesEjecutivosController = ReportesEjecutivosController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('periodo')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "obtenerDashboardData", null);
__decorate([
    (0, common_1.Post)('exportar/pdf'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "exportarPDF", null);
__decorate([
    (0, common_1.Post)('exportar/excel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "exportarExcel", null);
__decorate([
    (0, common_1.Get)('kpis'),
    __param(0, (0, common_1.Query)('periodo')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "obtenerKPIs", null);
__decorate([
    (0, common_1.Get)('graficos'),
    __param(0, (0, common_1.Query)('periodo')),
    __param(1, (0, common_1.Query)('tipo')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReportesEjecutivosController.prototype, "obtenerDatosGraficos", null);
exports.ReportesEjecutivosController = ReportesEjecutivosController = __decorate([
    (0, common_1.Controller)('api/reportes/ejecutivos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reportes_ejecutivos_service_1.ReportesEjecutivosService])
], ReportesEjecutivosController);
//# sourceMappingURL=reportes-ejecutivos.controller.js.map