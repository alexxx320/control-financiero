import { Model } from 'mongoose';
import { FondoDocument } from '../fondos/schemas/fondo.schema';
import { TransaccionDocument } from '../transacciones/schemas/transaccion.schema';
export declare class DiagnosticoService {
    private fondoModel;
    private transaccionModel;
    constructor(fondoModel: Model<FondoDocument>, transaccionModel: Model<TransaccionDocument>);
    diagnosticarSistema(): Promise<any>;
    generarReporteDiagnostico(usuarioId: string): Promise<any>;
}
