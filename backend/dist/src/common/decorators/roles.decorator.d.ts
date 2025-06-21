import { RolUsuario } from '../../modules/usuarios/schemas/usuario.schema';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: RolUsuario[]) => import("@nestjs/common").CustomDecorator<string>;
