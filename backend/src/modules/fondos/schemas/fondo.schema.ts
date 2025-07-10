import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TipoFondo } from '@/common/interfaces/financiero.interface';

export type FondoDocument = Fondo & Document;

@Schema({ timestamps: true })
export class Fondo {
  _id?: Types.ObjectId;

  @Prop({ 
    required: true, 
    type: Types.ObjectId, 
    ref: 'Usuario',
    index: true 
  })
  usuarioId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ trim: true })
  descripcion: string;

  @Prop({ 
    required: true, 
    enum: Object.values(TipoFondo),
    default: TipoFondo.REGISTRO  // 🔧 CAMBIADO: Registro como default
  })
  tipo: TipoFondo;

  @Prop({ required: true, default: 0 })
  saldoActual: number; // Puede ser negativo para préstamos

  @Prop({ min: 0, default: 0 })
  metaAhorro: number;

  @Prop({ default: Date.now })
  fechaCreacion: Date;

  @Prop({ default: true })
  activo: boolean;
}

export const FondoSchema = SchemaFactory.createForClass(Fondo);

// Índices para mejorar el rendimiento
FondoSchema.index({ usuarioId: 1, nombre: 1 });
FondoSchema.index({ usuarioId: 1, tipo: 1 });
FondoSchema.index({ usuarioId: 1, activo: 1 });
