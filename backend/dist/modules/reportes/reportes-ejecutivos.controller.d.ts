import { Response } from 'express';
import { ReportesEjecutivosService } from './reportes-ejecutivos.service';
export declare class ReportesEjecutivosController {
    private readonly reportesEjecutivosService;
    constructor(reportesEjecutivosService: ReportesEjecutivosService);
    obtenerDashboardData(periodo: string, req: any): Promise<any>;
    exportarPDF(request: {
        periodo: string;
    }, req: any, res: Response): Promise<void>;
    exportarExcel(request: {
        periodo: string;
    }, req: any, res: Response): Promise<void>;
    obtenerKPIs(periodo: string, req: any): Promise<any>;
    obtenerDatosGraficos(periodo: string, tipo: string, req: any): Promise<any>;
    private calcularFechasPeriodo;
}
