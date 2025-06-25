import { TransaccionesService } from './transacciones.service';
import { CreateTransaccionDto, UpdateTransaccionDto, FiltroTransaccionesDto, CreateTransferenciaDto } from '@/common/dto/transaccion.dto';
import { Transaccion } from './schemas/transaccion.schema';
export declare class TransaccionesController {
    private readonly transaccionesService;
    constructor(transaccionesService: TransaccionesService);
    create(createTransaccionDto: CreateTransaccionDto, usuarioId: string): Promise<Transaccion>;
    createTransferencia(createTransferenciaDto: CreateTransferenciaDto, usuarioId: string): Promise<{
        transaccionOrigen: Transaccion;
        transaccionDestino: Transaccion;
    }>;
    findAll(filtros: FiltroTransaccionesDto, usuarioId: string): Promise<{
        transacciones: Transaccion[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getEstadisticasPorCategoria(fondoId?: string): Promise<{
        categoria: string;
        total: number;
        cantidad: number;
        promedio: number;
    }[]>;
    getResumenMensual(año: number, mes: number, fondoId?: string): Promise<{
        ingresos: number;
        gastos: number;
        balance: number;
        transacciones: number;
        transferencias: number;
    }>;
    findByFondo(fondoId: string, filtros: FiltroTransaccionesDto, usuarioId: string): Promise<Transaccion[]>;
    findOne(id: string, usuarioId: string): Promise<Transaccion>;
    update(id: string, updateTransaccionDto: UpdateTransaccionDto, usuarioId: string): Promise<Transaccion>;
    remove(id: string, usuarioId: string): Promise<{
        message: string;
    }>;
}
