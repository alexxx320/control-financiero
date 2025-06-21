import { Model } from 'mongoose';
import { Transaccion, TransaccionDocument } from './schemas/transaccion.schema';
import { CreateTransaccionDto, UpdateTransaccionDto, FiltroTransaccionesDto } from '@/common/dto/transaccion.dto';
import { FondosService } from '../fondos/fondos.service';
export declare class TransaccionesService {
    private transaccionModel;
    private fondosService;
    constructor(transaccionModel: Model<TransaccionDocument>, fondosService: FondosService);
    create(createTransaccionDto: CreateTransaccionDto, usuarioId: string): Promise<Transaccion>;
    findAll(usuarioId: string, filtros?: FiltroTransaccionesDto): Promise<{
        transacciones: Transaccion[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findByFondo(fondoId: string, usuarioId: string, filtros?: FiltroTransaccionesDto): Promise<Transaccion[]>;
    findOne(id: string, usuarioId: string): Promise<Transaccion>;
    update(id: string, updateTransaccionDto: UpdateTransaccionDto, usuarioId: string): Promise<Transaccion>;
    remove(id: string, usuarioId: string): Promise<void>;
    getEstadisticasPorCategoria(fondoId?: string): Promise<Array<{
        categoria: string;
        total: number;
        cantidad: number;
        promedio: number;
    }>>;
    getResumenMensual(año: number, mes: number, fondoId?: string): Promise<{
        ingresos: number;
        gastos: number;
        balance: number;
        transacciones: number;
    }>;
}
