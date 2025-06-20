import { ReportesService } from './reportes.service';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    generarReporteMensual(mes: number, año: number, usuarioId: string): Promise<import("../../common/interfaces/financiero.interface").IReporteMensual>;
    generarReporteAnual(año: number, usuarioId: string): Promise<{
        año: number;
        meses: Array<{
            mes: number;
            nombreMes: string;
            ingresos: number;
            gastos: number;
            balance: number;
            transacciones: number;
        }>;
        resumenAnual: {
            totalIngresos: number;
            totalGastos: number;
            balanceNeto: number;
            mejorMes: {
                nombre: string;
                balance: number;
            } | null;
            peorMes: {
                nombre: string;
                balance: number;
            } | null;
        };
    }>;
    obtenerAlertas(usuarioId: string): Promise<import("../../common/interfaces/financiero.interface").IAlerta[]>;
    obtenerEstadisticas(usuarioId: string): Promise<import("../../common/interfaces/financiero.interface").IEstadisticas>;
}
