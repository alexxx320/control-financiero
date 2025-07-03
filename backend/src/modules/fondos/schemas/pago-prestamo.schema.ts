import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TipoPago } from '@/common/dto/prestamo.dto';

export type PagoPrestamoDocument = PagoPrestamo & Document;

@Schema({ timestamps: true })
export class PagoPrestamo {
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
    ref: 'Prestamo',
    index: true 
  })
  prestamoId: Types.ObjectId;

  @Prop({ 
    required: true, 
    type: Types.ObjectId, 
    ref: 'Fondo',
    index: true 
  })
  fondoId: Types.ObjectId;

  @Prop({ required: true, min: 0.01 })
  monto: number;

  @Prop({ required: true })
  fechaPago: Date;

  @Prop({ 
    required: true,
    enum: Object.values(TipoPago),
    default: TipoPago.ABONO
  })
  tipo: TipoPago;

  @Prop({ trim: true })
  descripcion: string;

  @Prop({ trim: true })
  notas: string;

  @Prop({ default: true })
  activo: boolean;
}

export const PagoPrestamoSchema = SchemaFactory.createForClass(PagoPrestamo);

// Índices para mejorar el rendimiento
PagoPrestamoSchema.index({ usuarioId: 1, prestamoId: 1 });
PagoPrestamoSchema.index({ usuarioId: 1, fechaPago: 1 });
PagoPrestamoSchema.index({ prestamoId: 1, fechaPago: -1 });
