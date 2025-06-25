import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TipoTransaccion, CategoriaTransaccion } from '@/common/interfaces/financiero.interface';

export type TransaccionDocument = Transaccion & Document;

@Schema({ timestamps: true })
export class Transaccion {
  @Prop({ 
    required: true, 
    type: Types.ObjectId, 
    ref: 'Usuario',
    index: true 
  })
  usuarioId: Types.ObjectId;

  @Prop({ 
    required: true, 
    type: Types.ObjectId, 
    ref: 'Fondo',
    index: true 
  })
  fondoId: Types.ObjectId;

  @Prop({ 
    required: false, 
    type: Types.ObjectId, 
    ref: 'Fondo',
    index: true 
  })
  fondoDestinoId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  descripcion: string;

  @Prop({ required: true, min: 0.01 })
  monto: number;

  @Prop({ 
    required: true, 
    enum: Object.values(TipoTransaccion) 
  })
  tipo: TipoTransaccion;

  @Prop({ 
    required: true, 
    enum: Object.values(CategoriaTransaccion) 
  })
  categoria: CategoriaTransaccion;

  @Prop({ default: Date.now, index: true })
  fecha: Date;

  @Prop({ trim: true })
  notas: string;

  @Prop({ type: [String], default: [] })
  etiquetas: string[];
}

export const TransaccionSchema = SchemaFactory.createForClass(Transaccion);

// Índices para mejorar el rendimiento de consultas
TransaccionSchema.index({ usuarioId: 1, fecha: -1 });
TransaccionSchema.index({ fondoId: 1, fecha: -1 });
TransaccionSchema.index({ usuarioId: 1, tipo: 1 });
TransaccionSchema.index({ usuarioId: 1, categoria: 1 });
TransaccionSchema.index({ fecha: -1 });
TransaccionSchema.index({ monto: 1 });
