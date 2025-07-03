import { PrestamosService } from './prestamos.service';
import { CreatePrestamoDto, UpdatePrestamoDto, CreatePagoPrestamoDto } from '@/common/dto/prestamo.dto';
export declare class PrestamosController {
    private readonly prestamosService;
    constructor(prestamosService: PrestamosService);
    create(createPrestamoDto: CreatePrestamoDto, req: any): Promise<import("./schemas/prestamo.schema").Prestamo>;
    findAll(req: any, fondoId?: string): Promise<import("./schemas/prestamo.schema").Prestamo[]>;
    obtenerEstadisticas(req: any, fondoId?: string): Promise<any>;
    obtenerResumenDeudores(req: any, fondoId?: string): Promise<any[]>;
    findOne(id: string, req: any): Promise<import("./schemas/prestamo.schema").Prestamo>;
    update(id: string, updatePrestamoDto: UpdatePrestamoDto, req: any): Promise<import("./schemas/prestamo.schema").Prestamo>;
    remove(id: string, req: any): Promise<void>;
    registrarPago(prestamoId: string, createPagoDto: CreatePagoPrestamoDto, req: any): Promise<import("./schemas/pago-prestamo.schema").PagoPrestamo>;
    obtenerPagos(prestamoId: string, req: any): Promise<import("./schemas/pago-prestamo.schema").PagoPrestamo[]>;
    actualizarVencidos(): Promise<number>;
}
