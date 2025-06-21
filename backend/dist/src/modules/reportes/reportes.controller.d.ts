import { Response } from 'express';
import { ReportesService } from './reportes.service';
import { DiagnosticoService } from './diagnostico.service';
export declare class ReportesController {
    private readonly reportesService;
    private readonly diagnosticoService;
    constructor(reportesService: ReportesService, diagnosticoService: DiagnosticoService);
    obtenerDashboard(periodo: string, req: any): Promise<any>;
    obtenerReporteMensual(mes: string, año: string, req: any): Promise<any>;
    obtenerReporteAnual(año: string, req: any): Promise<any>;
    obtenerAlertas(req: any): Promise<any>;
    obtenerEstadisticas(req: any): Promise<any>;
    obtenerDatosGraficos(periodo: string, tipo: string, req: any): Promise<any>;
    exportarPDF(body: any, res: Response, req: any): Promise<void>;
    exportarExcel(body: any, res: Response, req: any): Promise<void>;
    diagnosticoSistema(): Promise<any>;
    diagnosticoUsuario(req: any): Promise<any>;
    test(): any;
    private calcularRangoPeriodo;
    private generarTendenciaPorPeriodo;
    private generarFlujoCajaSimulado;
}
