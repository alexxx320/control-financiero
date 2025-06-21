import { Document } from 'mongoose';
export type UsuarioDocument = Usuario & Document;
export declare enum RolUsuario {
    ADMIN = "admin",
    USUARIO = "usuario"
}
export declare class Usuario {
    email: string;
    nombre: string;
    apellido: string;
    password: string;
    rol: RolUsuario;
    activo: boolean;
    fechaRegistro: Date;
    ultimoLogin: Date;
    telefono: string;
    avatar: string;
    preferencias: {
        monedaPrincipal: string;
        formatoFecha: string;
        notificacionesEmail: boolean;
        notificacionesAlertas: boolean;
    };
}
export declare const UsuarioSchema: import("mongoose").Schema<Usuario, import("mongoose").Model<Usuario, any, any, any, Document<unknown, any, Usuario> & Usuario & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Usuario, Document<unknown, {}, import("mongoose").FlatRecord<Usuario>> & import("mongoose").FlatRecord<Usuario> & {
    _id: import("mongoose").Types.ObjectId;
}>;
