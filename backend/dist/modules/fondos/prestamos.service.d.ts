import { Model } from 'mongoose';
import { Prestamo, PrestamoDocument } from './schemas/prestamo.schema';
import { PagoPrestamo, PagoPrestamoDocument } from './schemas/pago-prestamo.schema';
import { FondoDocument } from './schemas/fondo.schema';
import { CreatePrestamoDto, UpdatePrestamoDto, CreatePagoPrestamoDto } from '@/common/dto/prestamo.dto';
import { FondosService } from './fondos.service';
export declare class PrestamosService {
    private prestamoModel;
    private pagoPrestamoModel;
    private fondoModel;
    private fondosService;
    constructor(prestamoModel: Model<PrestamoDocument>, pagoPrestamoModel: Model<PagoPrestamoDocument>, fondoModel: Model<FondoDocument>, fondosService: FondosService);
    create(createPrestamoDto: CreatePrestamoDto, usuarioId: string): Promise<Prestamo>;
    findAll(usuarioId: string, fondoId?: string): Promise<Prestamo[]>;
    findOne(id: string, usuarioId: string): Promise<Prestamo>;
    update(id: string, updatePrestamoDto: UpdatePrestamoDto, usuarioId: string): Promise<Prestamo>;
    remove(id: string, usuarioId: string): Promise<void>;
    registrarPago(createPagoDto: CreatePagoPrestamoDto, usuarioId: string): Promise<PagoPrestamo>;
    obtenerPagosPrestamo(prestamoId: string, usuarioId: string): Promise<PagoPrestamo[]>;
    obtenerEstadisticas(usuarioId: string, fondoId?: string): Promise<any>;
    obtenerResumenPorDeudor(usuarioId: string, fondoId?: string): Promise<any[]>;
    actualizarEstadosVencidos(): Promise<number>;
}
