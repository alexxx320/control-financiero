import { Response } from 'express';
import { ReportesService } from './reportes.service';
export declare class ReportesController {
    private readonly reportesService;
    constructor(reportesService: ReportesService);
    obtenerDashboard(periodo: string, req: any): Promise<any>;
    obtenerReporteMensual(mes: string, año: string, req: any): Promise<any>;
    obtenerReporteAnual(año: string, req: any): Promise<any>;
    obtenerAlertas(req: any): Promise<any>;
    obtenerEstadisticas(req: any): Promise<any>;
    obtenerDatosGraficos(periodo: string, tipo: string, req: any): Promise<any>;
    exportarPDF(body: any, res: Response, req: any): Promise<void>;
    exportarExcel(body: any, res: Response, req: any): Promise<void>;
    test(): any;
}
