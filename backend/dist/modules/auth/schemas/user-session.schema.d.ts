import { Document, Types } from 'mongoose';
export type UserSessionDocument = UserSession & Document;
export declare class UserSession {
    userId: Types.ObjectId;
    deviceId: string;
    deviceName: string;
    deviceFingerprint: string;
    userAgent: string;
    ipAddress: string;
    location?: string;
    createdAt: Date;
    lastActivity: Date;
    isActive: boolean;
}
export declare const UserSessionSchema: import("mongoose").Schema<UserSession, import("mongoose").Model<UserSession, any, any, any, Document<unknown, any, UserSession> & UserSession & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserSession, Document<unknown, {}, import("mongoose").FlatRecord<UserSession>> & import("mongoose").FlatRecord<UserSession> & {
    _id: Types.ObjectId;
}>;
