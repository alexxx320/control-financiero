import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EstadoPrestamo } from '@/common/dto/prestamo.dto';

export type PrestamoDocument = Prestamo & Document;

@Schema({ timestamps: true })
export class Prestamo {
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

  @Prop({ required: true, trim: true })
  nombreDeudor: string;

  @Prop({ trim: true })
  contacto: string; // Teléfono, email, etc.

  @Prop({ required: true, min: 0.01 })
  montoOriginal: number;

  @Prop({ required: true, default: 0, min: 0 })
  montoAbonado: number;

  @Prop({ required: true })
  fechaPrestamo: Date;

  @Prop()
  fechaVencimiento: Date;

  @Prop({ trim: true })
  descripcion: string;

  @Prop({ 
    required: true,
    enum: Object.values(EstadoPrestamo),
    default: EstadoPrestamo.ACTIVO
  })
  estado: EstadoPrestamo;

  @Prop({ trim: true })
  notas: string;

  @Prop({ default: true })
  activo: boolean;
}

export const PrestamoSchema = SchemaFactory.createForClass(Prestamo);

// Índices para mejorar el rendimiento
PrestamoSchema.index({ usuarioId: 1, fondoId: 1 });
PrestamoSchema.index({ usuarioId: 1, estado: 1 });
PrestamoSchema.index({ usuarioId: 1, fechaVencimiento: 1 });
PrestamoSchema.index({ nombreDeudor: 1, usuarioId: 1 });

// Campos virtuales
PrestamoSchema.virtual('saldoPendiente').get(function() {
  return this.montoOriginal - this.montoAbonado;
});

PrestamoSchema.virtual('porcentajePagado').get(function() {
  return (this.montoAbonado / this.montoOriginal) * 100;
});

// Asegurar que los campos virtuales se incluyan en JSON
PrestamoSchema.set('toJSON', { virtuals: true });
PrestamoSchema.set('toObject', { virtuals: true });
