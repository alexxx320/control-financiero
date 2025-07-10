import { Document, Types } from 'mongoose';
import { TipoFondo } from '@/common/interfaces/financiero.interface';
export type FondoDocument = Fondo & Document;
export declare class Fondo {
    _id?: Types.ObjectId;
    usuarioId: Types.ObjectId;
    nombre: string;
    descripcion: string;
    tipo: TipoFondo;
    saldoActual: number;
    metaAhorro: number;
    fechaCreacion: Date;
    activo: boolean;
}
export declare const FondoSchema: import("mongoose").Schema<Fondo, import("mongoose").Model<Fondo, any, any, any, Document<unknown, any, Fondo> & Fondo & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Fondo, Document<unknown, {}, import("mongoose").FlatRecord<Fondo>> & import("mongoose").FlatRecord<Fondo> & Required<{
    _id: Types.ObjectId;
}>>;
