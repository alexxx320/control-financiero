import { Document, Types } from 'mongoose';
export type RefreshTokenDocument = RefreshToken & Document;
export declare class RefreshToken {
    userId: Types.ObjectId;
    token: string;
    deviceId: string;
    deviceFingerprint: string;
    userAgent: string;
    ipAddress: string;
    location?: string;
    createdAt: Date;
    expiresAt: Date;
    lastUsed: Date;
    isActive: boolean;
    isRevoked: boolean;
}
export declare const RefreshTokenSchema: import("mongoose").Schema<RefreshToken, import("mongoose").Model<RefreshToken, any, any, any, Document<unknown, any, RefreshToken> & RefreshToken & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RefreshToken, Document<unknown, {}, import("mongoose").FlatRecord<RefreshToken>> & import("mongoose").FlatRecord<RefreshToken> & {
    _id: Types.ObjectId;
}>;
