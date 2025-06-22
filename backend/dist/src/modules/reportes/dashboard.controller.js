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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const fondos_service_1 = require("../fondos/fondos.service");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DashboardController = class DashboardController {
    constructor(dashboardService, fondosService) {
        this.dashboardService = dashboardService;
        this.fondosService = fondosService;
    }
    async obtenerResumenDashboard(fechaInicio, fechaFin, usuarioId) {
        console.log('📊 DashboardController - Obteniendo resumen para usuario:', usuarioId);
        try {
            const [resumenFinanciero, estadisticas, fondos] = await Promise.all([
                this.dashboardService.obtenerResumenFinanciero(usuarioId, fechaInicio, fechaFin),
                this.dashboardService.obtenerEstadisticas(usuarioId, fechaInicio, fechaFin),
                this.fondosService.findAll(usuarioId)
            ]);
            const fechaActual = new Date();
            const mesActual = fechaActual.getMonth() + 1;
            const añoActual = fechaActual.getFullYear();
            const resumen = {
                resumenFinanciero,
                estadisticas,
                fondos: fondos.map(fondo => ({
                    ...fondo,
                    id: fondo._id?.toString() || fondo.id,
                    progresoMeta: this.calcularProgresoMeta(fondo)
                })),
                periodo: {
                    mes: mesActual,
                    año: añoActual,
                    descripcion: fechaActual.toLocaleDateString('es-ES', {
                        month: 'long',
                        year: 'numeric'
                    })
                },
                timestamp: new Date().toISOString(),
                conectado: true
            };
            console.log('✅ DashboardController - Resumen generado exitosamente para usuario:', usuarioId);
            return resumen;
        }
        catch (error) {
            console.error('❌ DashboardController - Error al generar resumen:', error);
            throw error;
        }
    }
    async verificarConectividad() {
        const conectado = await this.dashboardService.verificarConectividad();
        return { conectado, timestamp: new Date().toISOString() };
    }
    async obtenerResumenFinanciero(fechaInicio, fechaFin, usuarioId) {
        return await this.dashboardService.obtenerResumenFinanciero(usuarioId, fechaInicio, fechaFin);
    }
    async obtenerEstadisticas(fechaInicio, fechaFin, usuarioId) {
        return await this.dashboardService.obtenerEstadisticas(usuarioId, fechaInicio, fechaFin);
    }
    async obtenerAlertasDashboard(usuarioId) {
        console.log('🚨 DashboardController - Obteniendo alertas para usuario:', usuarioId);
        try {
            const alertasPersonalizadas = await this.generarAlertasPersonalizadas(usuarioId);
            return {
                alertas: alertasPersonalizadas,
                total: alertasPersonalizadas.length,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('❌ Error al obtener alertas:', error);
            return {
                alertas: [],
                total: 0,
                error: 'No se pudieron cargar las alertas'
            };
        }
    }
    async obtenerEstadisticasRapidas(usuarioId) {
        console.log('⚡ DashboardController - Obteniendo estadísticas rápidas para usuario:', usuarioId);
        try {
            const [fondos, estadisticas] = await Promise.all([
                this.fondosService.findAll(usuarioId),
                this.dashboardService.obtenerEstadisticas(usuarioId)
            ]);
            return {
                fondosActivos: fondos.filter(f => f.activo).length,
                totalFondos: fondos.length,
                balanceTotal: estadisticas.mayorIngreso - estadisticas.mayorGasto,
                transaccionesTotal: estadisticas.transaccionesMes,
                promedioGastoMensual: estadisticas.mayorGasto,
                fondoMayorBalance: fondos.length > 0 ? fondos[0].nombre : 'N/A',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('❌ Error al obtener estadísticas rápidas:', error);
            return {
                fondosActivos: 0,
                totalFondos: 0,
                balanceTotal: 0,
                transaccionesTotal: 0,
                promedioGastoMensual: 0,
                fondoMayorBalance: 'N/A',
                error: 'No se pudieron cargar las estadísticas'
            };
        }
    }
    procesarFondosPorTipo(fondos) {
        const tiposMap = new Map();
        fondos.forEach(fondo => {
            const tipo = this.determinarTipoFondo(fondo.nombre);
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
            tipoData.montoTotal += fondo.balanceFinal || 0;
        });
        tiposMap.forEach((value) => {
            value.progreso = Math.min((value.montoTotal / 1000000) * 100, 100);
        });
        return Array.from(tiposMap.values());
    }
    determinarTipoFondo(nombre) {
        const nombreLower = nombre.toLowerCase();
        if (nombreLower.includes('ahorro'))
            return 'ahorro';
        if (nombreLower.includes('emergencia'))
            return 'emergencia';
        if (nombreLower.includes('personal') || nombreLower.includes('vacacion'))
            return 'personal';
        if (nombreLower.includes('inversion'))
            return 'inversion';
        return 'otros';
    }
    calcularProgresoMeta(fondo) {
        if (!fondo.metaAhorro || fondo.metaAhorro === 0) {
            return 0;
        }
        const progreso = (fondo.saldoActual / fondo.metaAhorro) * 100;
        return Math.min(Math.round(progreso), 100);
    }
    calcularMayorIngreso(fondos) {
        if (!fondos || fondos.length === 0)
            return 0;
        return fondos.reduce((max, fondo) => {
            return Math.max(max, fondo.ingresos || 0);
        }, 0);
    }
    async obtenerTransaccionesHoy(usuarioId) {
        try {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const mañana = new Date(hoy);
            mañana.setDate(mañana.getDate() + 1);
            return Math.floor(Math.random() * 5);
        }
        catch (error) {
            console.error('Error al obtener transacciones de hoy:', error);
            return 0;
        }
    }
    async generarAlertasPersonalizadas(usuarioId) {
        try {
            const fondos = await this.fondosService.findAll(usuarioId);
            const alertas = [];
            const fondosSinMeta = fondos.filter(f => !f.metaAhorro || f.metaAhorro === 0);
            if (fondosSinMeta.length > 0) {
                alertas.push({
                    tipo: 'INFO',
                    fondo: 'General',
                    mensaje: `${fondosSinMeta.length} fondo(s) sin meta de ahorro definida`,
                    prioridad: 'BAJA'
                });
            }
            const fondosInactivos = fondos.filter(f => !f.activo);
            if (fondosInactivos.length > 0) {
                alertas.push({
                    tipo: 'ADVERTENCIA',
                    fondo: 'General',
                    mensaje: `${fondosInactivos.length} fondo(s) inactivo(s)`,
                    prioridad: 'MEDIA'
                });
            }
            return alertas;
        }
        catch (error) {
            console.error('Error al generar alertas personalizadas:', error);
            return [];
        }
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('resumen'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener resumen completo para el dashboard' }),
    (0, swagger_1.ApiQuery)({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'fechaFin', required: false, description: 'Fecha de fin (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Resumen del dashboard obtenido exitosamente'
    }),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __param(2, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "obtenerResumenDashboard", null);
__decorate([
    (0, common_1.Get)('conectividad'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar conectividad del backend' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estado de conectividad verificado'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "verificarConectividad", null);
__decorate([
    (0, common_1.Get)('resumen-financiero'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener solo el resumen financiero' }),
    (0, swagger_1.ApiQuery)({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'fechaFin', required: false, description: 'Fecha de fin (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Resumen financiero obtenido exitosamente'
    }),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __param(2, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "obtenerResumenFinanciero", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener solo las estadísticas del dashboard' }),
    (0, swagger_1.ApiQuery)({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'fechaFin', required: false, description: 'Fecha de fin (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estadísticas obtenidas exitosamente'
    }),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('fechaFin')),
    __param(2, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "obtenerEstadisticas", null);
__decorate([
    (0, common_1.Get)('alertas'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener alertas personalizadas para el dashboard' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Alertas obtenidas exitosamente'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "obtenerAlertasDashboard", null);
__decorate([
    (0, common_1.Get)('estadisticas-rapidas'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas rápidas para el dashboard' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estadísticas rápidas obtenidas exitosamente'
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "obtenerEstadisticasRapidas", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService,
        fondos_service_1.FondosService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map