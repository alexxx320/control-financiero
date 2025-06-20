import { TipoFondo } from '../interfaces/financiero.interface';
export declare class CreateFondoDto {
    nombre: string;
    descripcion?: string;
    tipo: TipoFondo;
    saldoActual?: number;
    metaAhorro?: number;
}
export declare class UpdateFondoDto {
    nombre?: string;
    descripcion?: string;
    tipo?: TipoFondo;
    metaAhorro?: number;
    activo?: boolean;
}
