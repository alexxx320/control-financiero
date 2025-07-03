import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Usuario' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  deviceId: string;

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

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true, default: Date.now })
  lastUsed: Date;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ default: false })
  isRevoked: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Índices para optimizar consultas
RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ userId: 1, deviceId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ userId: 1, isActive: 1 });
