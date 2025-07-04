import { FondosService } from './fondos.service';
import { CreateFondoDto, UpdateFondoDto } from '@/common/dto/fondo.dto';
import { Fondo } from './schemas/fondo.schema';
export declare class FondosController {
    private readonly fondosService;
    constructor(fondosService: FondosService);
    create(createFondoDto: CreateFondoDto, usuarioId: string): Promise<Fondo>;
    findAll(tipo: string, usuarioId: string): Promise<Fondo[]>;
    getEstadisticas(usuarioId: string): Promise<{
        totalFondos: number;
        fondosConMetas: number;
        metaPromedioAhorro: number;
    }>;
    getEstadisticasPrestamos(usuarioId: string): Promise<{
        totalPrestamos: number;
        prestamosActivos: number;
        montoTotalPrestado: number;
        montoTotalPagado: number;
        montoTotalPendiente: number;
        progresoPromedioPagos: number;
    }>;
    getProgresoPrestamo(id: string, usuarioId: string): Promise<{
        porcentajePagado: number;
        montoPagado: number;
        montoPendiente: number;
        estaCompletado: boolean;
    }>;
    getEstadisticasDeudas(usuarioId: string): Promise<{
        totalDeudas: number;
        deudasActivas: number;
        montoTotalDebe: number;
        montoTotalPagado: number;
        montoTotalPendiente: number;
        progresoPromedioPagos: number;
    }>;
    getProgresoDeuda(id: string, usuarioId: string): Promise<{
        porcentajePagado: number;
        montoPagado: number;
        montoPendiente: number;
        estaLiquidada: boolean;
    }>;
    findOne(id: string, usuarioId: string): Promise<Fondo>;
    update(id: string, updateFondoDto: UpdateFondoDto, usuarioId: string): Promise<Fondo>;
    remove(id: string, usuarioId: string): Promise<{
        message: string;
    }>;
}
