import { Document, Types } from 'mongoose';
import { EstadoPrestamo } from '@/common/dto/prestamo.dto';
export type PrestamoDocument = Prestamo & Document;
export declare class Prestamo {
    usuarioId: Types.ObjectId;
    fondoId: Types.ObjectId;
    nombreDeudor: string;
    contacto: string;
    montoOriginal: number;
    montoAbonado: number;
    fechaPrestamo: Date;
    fechaVencimiento: Date;
    descripcion: string;
    estado: EstadoPrestamo;
    notas: string;
    activo: boolean;
}
export declare const PrestamoSchema: import("mongoose").Schema<Prestamo, import("mongoose").Model<Prestamo, any, any, any, Document<unknown, any, Prestamo> & Prestamo & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Prestamo, Document<unknown, {}, import("mongoose").FlatRecord<Prestamo>> & import("mongoose").FlatRecord<Prestamo> & {
    _id: Types.ObjectId;
}>;
