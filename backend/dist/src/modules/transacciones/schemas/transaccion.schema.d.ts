import { Document, Types } from 'mongoose';
import { TipoTransaccion, CategoriaTransaccion } from '@/common/interfaces/financiero.interface';
export type TransaccionDocument = Transaccion & Document;
export declare class Transaccion {
    usuarioId: Types.ObjectId;
    fondoId: Types.ObjectId;
    descripcion: string;
    monto: number;
    tipo: TipoTransaccion;
    categoria: CategoriaTransaccion;
    fecha: Date;
    notas: string;
    etiquetas: string[];
}
export declare const TransaccionSchema: import("mongoose").Schema<Transaccion, import("mongoose").Model<Transaccion, any, any, any, Document<unknown, any, Transaccion> & Transaccion & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transaccion, Document<unknown, {}, import("mongoose").FlatRecord<Transaccion>> & import("mongoose").FlatRecord<Transaccion> & {
    _id: Types.ObjectId;
}>;
