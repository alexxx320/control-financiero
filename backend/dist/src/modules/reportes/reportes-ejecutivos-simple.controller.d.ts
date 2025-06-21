import { Response } from 'express';
import { ReportesService } from './reportes.service';
export declare class ReportesEjecutivosController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    obtenerDashboard(periodo?: string): Promise<any>;
    obtenerKPIs(periodo?: string): Promise<any>;
    obtenerDatosGraficos(periodo?: string, tipo?: string): Promise<any>;
    exportarPDF(body: any, res: Response): Promise<void>;
    exportarExcel(body: any, res: Response): Promise<void>;
    test(): any;
}
