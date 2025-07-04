import { Model } from 'mongoose';
import { Fondo, FondoDocument } from './schemas/fondo.schema';
import { TransaccionDocument } from '../transacciones/schemas/transaccion.schema';
import { CreateFondoDto, UpdateFondoDto } from '@/common/dto/fondo.dto';
import { TipoTransaccion } from '@/common/interfaces/financiero.interface';
export declare class FondosService {
    private fondoModel;
    private transaccionModel;
    constructor(fondoModel: Model<FondoDocument>, transaccionModel: Model<TransaccionDocument>);
    create(createFondoDto: CreateFondoDto, usuarioId: string): Promise<Fondo>;
    findAll(usuarioId: string): Promise<Fondo[]>;
    findOne(id: string, usuarioId: string): Promise<Fondo>;
    update(id: string, updateFondoDto: UpdateFondoDto, usuarioId: string): Promise<Fondo>;
    remove(id: string, usuarioId: string): Promise<void>;
    findByTipo(tipo: string, usuarioId: string): Promise<Fondo[]>;
    getTotalFondos(usuarioId: string): Promise<number>;
    getFondosConMetas(usuarioId: string): Promise<Fondo[]>;
    actualizarSaldo(fondoId: string, tipo: TipoTransaccion, monto: number, usuarioId: string): Promise<Fondo>;
    getEstadisticasPersonalizadas(usuarioId: string): Promise<{
        totalFondos: number;
        fondosActivos: number;
        fondosConMetas: number;
        metaPromedioAhorro: number;
        saldoTotalActual: number;
        fondoMayorSaldo: {
            nombre: string;
            saldo: number;
        } | null;
        progresoPromedioMetas: number;
    }>;
    getEstadisticasPrestamos(usuarioId: string): Promise<{
        totalPrestamos: number;
        prestamosActivos: number;
        montoTotalPrestado: number;
        montoTotalPagado: number;
        montoTotalPendiente: number;
        progresoPromedioPagos: number;
    }>;
    getProgresoPrestamo(prestamo: Fondo): {
        porcentajePagado: number;
        montoPagado: number;
        montoPendiente: number;
        estaCompletado: boolean;
    };
    getEstadisticasDeudas(usuarioId: string): Promise<{
        totalDeudas: number;
        deudasActivas: number;
        montoTotalDebe: number;
        montoTotalPagado: number;
        montoTotalPendiente: number;
        progresoPromedioPagos: number;
    }>;
    getProgresoDeuda(deuda: Fondo): {
        porcentajePagado: number;
        montoPagado: number;
        montoPendiente: number;
        estaLiquidada: boolean;
    };
}
