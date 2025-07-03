import { Document, Types } from 'mongoose';
import { TipoPago } from '@/common/dto/prestamo.dto';
export type PagoPrestamoDocument = PagoPrestamo & Document;
export declare class PagoPrestamo {
    usuarioId: Types.ObjectId;
    prestamoId: Types.ObjectId;
    fondoId: Types.ObjectId;
    monto: number;
    fechaPago: Date;
    tipo: TipoPago;
    descripcion: string;
    notas: string;
    activo: boolean;
}
export declare const PagoPrestamoSchema: import("mongoose").Schema<PagoPrestamo, import("mongoose").Model<PagoPrestamo, any, any, any, Document<unknown, any, PagoPrestamo> & PagoPrestamo & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PagoPrestamo, Document<unknown, {}, import("mongoose").FlatRecord<PagoPrestamo>> & import("mongoose").FlatRecord<PagoPrestamo> & {
    _id: Types.ObjectId;
}>;
