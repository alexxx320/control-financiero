import { Model } from 'mongoose';
import { FondoDocument } from '../fondos/schemas/fondo.schema';
import { TransaccionDocument } from '../transacciones/schemas/transaccion.schema';
import { IReporteMensual, IAlerta, IEstadisticas } from '@/common/interfaces/financiero.interface';
export declare class ReportesService {
    private fondoModel;
    private transaccionModel;
    constructor(fondoModel: Model<FondoDocument>, transaccionModel: Model<TransaccionDocument>);
    generarReporteMensual(mes: number, año: number, usuarioId: string): Promise<IReporteMensual>;
    obtenerAlertasFinancieras(usuarioId: string): Promise<IAlerta[]>;
    obtenerEstadisticasGenerales(usuarioId: string): Promise<IEstadisticas>;
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
    generarReportePorPeriodo(fechaInicio: Date, fechaFin: Date, nombrePeriodo: string, usuarioId: string): Promise<IReporteMensual>;
    obtenerHistorialTransacciones(fechaInicio: Date, fechaFin: Date, usuarioId: string): Promise<any[]>;
    private calcularBalanceTotal;
}
