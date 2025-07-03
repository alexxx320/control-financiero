import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserSessionDocument = UserSession & Document;

@Schema({ timestamps: true })
export class UserSession {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Usuario' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  deviceFingerprint: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop()
  location?: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  lastActivity: Date;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);

// Índices para optimizar consultas
UserSessionSchema.index({ userId: 1, isActive: 1 });
UserSessionSchema.index({ deviceId: 1 });
UserSessionSchema.index({ userId: 1, deviceId: 1 });
