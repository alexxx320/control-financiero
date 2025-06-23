import { Model } from 'mongoose';
import { FondoDocument } from '../fondos/schemas/fondo.schema';
import { TransaccionDocument } from '../transacciones/schemas/transaccion.schema';
export interface IReporteEjecutivo {
    periodo: {
        inicio: Date;
        fin: Date;
        descripcion: string;
    };
    kpis: {
        totalIngresos: number;
        totalGastos: number;
        utilidadNeta: number;
        margenUtilidad: number;
        crecimiento: number;
        fondosActivos: number;
        transaccionesPromedio: number;
    };
    tendenciaMensual: Array<{
        mes: string;
        ingresos: number;
        gastos: number;
        utilidad: number;
        transacciones: number;
    }>;
    distribucionCategorias: Array<{
        categoria: string;
        monto: number;
        porcentaje: number;
        transacciones: number;
        tipo: 'ingreso' | 'gasto';
    }>;
    fondosPerformance: Array<{
        nombre: string;
        tipo: string;
        saldoActual: number;
        metaAhorro: number;
        progresoMeta: number;
        transacciones: number;
        rendimiento: 'excelente' | 'bueno' | 'regular' | 'malo';
    }>;
    flujoCaja: Array<{
        fecha: string;
        entradas: number;
        salidas: number;
        neto: number;
        acumulado: number;
    }>;
}
export declare class ReportesEjecutivosService {
    private fondoModel;
    private transaccionModel;
    constructor(fondoModel: Model<FondoDocument>, transaccionModel: Model<TransaccionDocument>);
    generarReporteEjecutivo(usuarioId: string, fechaInicio: Date, fechaFin: Date): Promise<IReporteEjecutivo>;
    exportarPDF(reporteEjecutivo: IReporteEjecutivo): Promise<Buffer>;
    exportarExcel(reporteEjecutivo: IReporteEjecutivo): Promise<Buffer>;
    private obtenerFondosUsuario;
    private obtenerTransacciones;
    private calcularKPIs;
    private generarTendenciaMensual;
    private analizarDistribucionCategorias;
    private evaluarPerformanceFondos;
    private calcularFlujoCaja;
    private formatearCategoria;
    private formatearTipoFondo;
}
