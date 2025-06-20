import { Model } from 'mongoose';
import { FondoDocument } from '../fondos/schemas/fondo.schema';
import { TransaccionDocument } from '../transacciones/schemas/transaccion.schema';
export declare class DashboardService {
    private fondoModel;
    private transaccionModel;
    constructor(fondoModel: Model<FondoDocument>, transaccionModel: Model<TransaccionDocument>);
    obtenerResumenFinanciero(usuarioId: string, fechaInicio?: string, fechaFin?: string): Promise<{
        totalIngresos: number;
        totalGastos: number;
        balance: number;
        fondosPorTipo: any[];
        transaccionesPorCategoria: any[];
        tendenciaMensual: any[];
    }>;
    obtenerEstadisticas(usuarioId: string): Promise<{
        totalFondos: number;
        fondosActivos: number;
        transaccionesHoy: number;
        transaccionesMes: number;
        mayorGasto: number;
        mayorIngreso: number;
    }>;
    verificarConectividad(): Promise<boolean>;
    private procesarFondosPorTipo;
    private procesarTransaccionesPorCategoria;
}
