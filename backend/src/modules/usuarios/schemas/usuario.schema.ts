import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

export enum RolUsuario {
  ADMIN = 'admin',
  USUARIO = 'usuario',
}

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true 
  })
  email: string;

  @Prop({ 
    required: true, 
    trim: true 
  })
  nombre: string;

  @Prop({ 
    required: true, 
    trim: true 
  })
  apellido: string;

  @Prop({ 
    required: true 
  })
  password: string;

  @Prop({ 
    enum: Object.values(RolUsuario),
    default: RolUsuario.USUARIO 
  })
  rol: RolUsuario;

  @Prop({ 
    default: true 
  })
  activo: boolean;

  @Prop({ 
    default: Date.now 
  })
  fechaRegistro: Date;

  @Prop()
  ultimoLogin: Date;

  @Prop({ 
    trim: true 
  })
  telefono: string;

  @Prop({ 
    trim: true 
  })
  avatar: string;

  @Prop({
    type: Object,
    default: {
      monedaPrincipal: 'COP',
      formatoFecha: 'DD/MM/YYYY',
      notificacionesEmail: true,
      notificacionesAlertas: true,
    }
  })
  preferencias: {
    monedaPrincipal: string;
    formatoFecha: string;
    notificacionesEmail: boolean;
    notificacionesAlertas: boolean;
  };
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

// Índices
UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ activo: 1 });
UsuarioSchema.index({ fechaRegistro: -1 });
