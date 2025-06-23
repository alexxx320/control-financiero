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
    findOne(id: string, usuarioId: string): Promise<Fondo>;
    update(id: string, updateFondoDto: UpdateFondoDto, usuarioId: string): Promise<Fondo>;
    remove(id: string, usuarioId: string): Promise<{
        message: string;
    }>;
}
