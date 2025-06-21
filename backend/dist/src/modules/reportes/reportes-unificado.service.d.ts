import { Model } from 'mongoose';
import { Fondo } from '../fondos/schemas/fondo.schema';
import { Transaccion } from '../transacciones/schemas/transaccion.schema';
export declare class ReportesUnificadoService {
    private fondoModel;
    private transaccionModel;
    constructor(fondoModel: Model<Fondo>, transaccionModel: Model<Transaccion>);
    generarReporteBase(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<{
        periodo: string;
        fechaInicio: Date;
        fechaFin: Date;
        fondos: any[];
        resumen: {
            totalIngresos: number;
            totalGastos: number;
            balanceNeto: number;
            transaccionesTotales: number;
            fondosActivos: number;
            promedioIngresoPorFondo: number;
            promedioGastoPorFondo: number;
        };
    }>;
    calcularKPIs(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<{
        totalIngresos: number;
        totalGastos: number;
        utilidadNeta: number;
        margenUtilidad: number;
        fondosActivos: number;
        transaccionesPromedio: number;
        crecimientoMensual: number;
        liquidezTotal: any;
    }>;
    obtenerTendenciaMensual(usuarioId: string, meses?: number): Promise<any[]>;
    obtenerDistribucionCategorias(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<{
        categoria: any;
        monto: any;
        porcentaje: number;
        transacciones: any;
    }[]>;
    obtenerPerformanceFondos(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<{
        id: any;
        nombre: any;
        tipo: any;
        balanceActual: any;
        objetivo: number;
        progresoMeta: number;
        rendimiento: string;
        crecimiento: number;
    }[]>;
    obtenerFlujoCaja(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<{
        fecha: any;
        entradas: any;
        salidas: any;
        neto: number;
    }[]>;
    obtenerAlertasFinancieras(usuarioId: string): Promise<any[]>;
    obtenerEstadisticasGenerales(usuarioId: string): Promise<{
        totalFondos: number;
        totalTransacciones: number;
        balanceTotal: number;
        fondoMayorBalance: string;
        categoriaFrecuente: string;
        promedioGastoMensual: number;
        diasDesdeUltimaTransaccion: number;
    }>;
    generarPDF(datos: any): Promise<Buffer>;
    generarExcel(datos: any): Promise<Buffer>;
}
