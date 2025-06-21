import { Response } from 'express';
import { ReportesUnificadoService } from './reportes-unificado.service';
interface FiltrosReporte {
    periodo: 'semana' | 'mes' | 'trimestre' | 'año';
    fechaInicio?: string;
    fechaFin?: string;
}
export declare class ReportesUnificadoController {
    private readonly reportesService;
    constructor(reportesService: ReportesUnificadoService);
    obtenerDashboard(periodo: string, req: any): Promise<any>;
    obtenerDatosGraficos(tipo: string, periodo: string, req: any): Promise<any>;
    obtenerReporte(mes: string, año: string, req: any): Promise<any>;
    obtenerAlertas(req: any): Promise<any>;
    exportarPDF(filtros: FiltrosReporte, req: any, res: Response): Promise<void>;
    exportarExcel(filtros: FiltrosReporte, req: any, res: Response): Promise<void>;
    test(): any;
    private calcularFechasPeriodo;
    private getDescripcionPeriodo;
}
export {};
