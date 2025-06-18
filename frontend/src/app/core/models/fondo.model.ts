export interface Fondo {
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoFondo;
  metaAhorro: number;
  fechaCreacion?: Date;
  activo?: boolean;
}

export type TipoFondo = 'ahorro' | 'inversion' | 'emergencia' | 'gastos' | 'personal';

export interface CreateFondoDto {
  nombre: string;
  descripcion?: string;
  tipo: TipoFondo;
  metaAhorro: number;
}

export interface UpdateFondoDto {
  nombre?: string;
  descripcion?: string;
  tipo?: TipoFondo;
  metaAhorro?: number;
  activo?: boolean;
}