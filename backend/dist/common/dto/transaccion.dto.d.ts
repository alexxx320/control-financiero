import { TipoTransaccion, CategoriaTransaccion } from '../interfaces/financiero.interface';
export declare class CreateTransaccionDto {
    fondoId: string;
    fondoDestinoId?: string;
    descripcion: string;
    monto: number;
    tipo: TipoTransaccion;
    categoria: CategoriaTransaccion;
    notas?: string;
    etiquetas?: string[];
    fecha?: Date;
}
export declare class CreateTransferenciaDto {
    fondoOrigenId: string;
    fondoDestinoId: string;
    monto: number;
    descripcion: string;
    notas?: string;
    fecha?: Date;
}
export declare class UpdateTransaccionDto {
    fondoId?: string;
    descripcion?: string;
    monto?: number;
    tipo?: TipoTransaccion;
    categoria?: CategoriaTransaccion;
    notas?: string;
    etiquetas?: string[];
    fecha?: Date;
}
export declare class FiltroTransaccionesDto {
    fondoId?: string;
    tipo?: TipoTransaccion;
    categoria?: CategoriaTransaccion;
    fecha?: string;
    fechaInicio?: string;
    fechaFin?: string;
    montoMin?: number;
    montoMax?: number;
    page?: number;
    limit?: number;
    pagina?: number;
    limite?: number;
}
