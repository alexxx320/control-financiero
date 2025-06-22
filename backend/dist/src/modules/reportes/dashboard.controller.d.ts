import { DashboardService } from './dashboard.service';
import { FondosService } from '../fondos/fondos.service';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly fondosService;
    constructor(dashboardService: DashboardService, fondosService: FondosService);
    obtenerResumenDashboard(fechaInicio?: string, fechaFin?: string, usuarioId?: string): Promise<{
        resumenFinanciero: {
            totalIngresos: number;
            totalGastos: number;
            balance: number;
            fondosPorTipo: any[];
            transaccionesPorCategoria: any[];
            tendenciaMensual: any[];
        };
        estadisticas: {
            totalFondos: number;
            fondosActivos: number;
            transaccionesHoy: number;
            transaccionesMes: number;
            mayorGasto: number;
            mayorIngreso: number;
        };
        fondos: {
            id: any;
            progresoMeta: number;
            usuarioId: import("mongoose").Types.ObjectId;
            nombre: string;
            descripcion: string;
            tipo: import("../../common/interfaces/financiero.interface").TipoFondo;
            saldoActual: number;
            metaAhorro: number;
            fechaCreacion: Date;
            activo: boolean;
        }[];
        periodo: {
            mes: number;
            año: number;
            descripcion: string;
        };
        timestamp: string;
        conectado: boolean;
    }>;
    verificarConectividad(): Promise<{
        conectado: boolean;
        timestamp: string;
    }>;
    obtenerResumenFinanciero(fechaInicio?: string, fechaFin?: string, usuarioId?: string): Promise<{
        totalIngresos: number;
        totalGastos: number;
        balance: number;
        fondosPorTipo: any[];
        transaccionesPorCategoria: any[];
        tendenciaMensual: any[];
    }>;
    obtenerEstadisticas(fechaInicio?: string, fechaFin?: string, usuarioId?: string): Promise<{
        totalFondos: number;
        fondosActivos: number;
        transaccionesHoy: number;
        transaccionesMes: number;
        mayorGasto: number;
        mayorIngreso: number;
    }>;
    obtenerDatosGrafico(fechaInicio?: string, fechaFin?: string, usuarioId?: string): Promise<{
        labels: any[];
        ingresos: any[];
        gastos: any[];
        periodo: "mes" | "hora" | "dia" | "semana";
    }>;
    obtenerAlertasDashboard(usuarioId: string): Promise<{
        alertas: any[];
        total: number;
        timestamp: string;
        error?: undefined;
    } | {
        alertas: any[];
        total: number;
        error: string;
        timestamp?: undefined;
    }>;
    obtenerEstadisticasRapidas(usuarioId: string): Promise<{
        fondosActivos: number;
        totalFondos: number;
        balanceTotal: number;
        transaccionesTotal: number;
        promedioGastoMensual: number;
        fondoMayorBalance: string;
        timestamp: string;
        error?: undefined;
    } | {
        fondosActivos: number;
        totalFondos: number;
        balanceTotal: number;
        transaccionesTotal: number;
        promedioGastoMensual: number;
        fondoMayorBalance: string;
        error: string;
        timestamp?: undefined;
    }>;
    private procesarFondosPorTipo;
    private determinarTipoFondo;
    private calcularProgresoMeta;
    private calcularMayorIngreso;
    private obtenerTransaccionesHoy;
    private generarAlertasPersonalizadas;
}
