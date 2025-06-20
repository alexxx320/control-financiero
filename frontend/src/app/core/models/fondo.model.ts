export interface Fondo {
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoFondo;
  saldoActual: number; // Saldo actual del fondo (billetera)
  metaAhorro?: number; // Meta opcional de ahorro
  fechaCreacion?: Date;
  activo?: boolean;
}

export type TipoFondo = 'ahorro' | 'inversion' | 'emergencia' | 'gastos' | 'personal';

export interface CreateFondoDto {
  nombre: string;
  descripcion?: string;
  tipo: TipoFondo;
  saldoActual?: number; // Saldo inicial (puede ser 0)
  metaAhorro?: number; // Meta opcional
}

export interface UpdateFondoDto {
  nombre?: string;
  descripcion?: string;
  tipo?: TipoFondo;
  metaAhorro?: number;
  activo?: boolean;
  // saldoActual no se actualiza directamente, solo via transacciones
}