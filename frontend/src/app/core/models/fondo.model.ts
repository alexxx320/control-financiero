export interface Fondo {
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoFondo;
  saldoActual: number; // Saldo actual del fondo
  metaAhorro?: number; // Meta de ahorro (solo para fondos tipo 'ahorro')
  fechaCreacion?: Date;
  activo?: boolean;
}

// 🔧 MODIFICADO: Solo dos tipos de fondo
export type TipoFondo = 'registro' | 'ahorro';

export interface CreateFondoDto {
  nombre: string;
  descripcion?: string;
  tipo: TipoFondo;
  saldoActual?: number; // Saldo inicial
  metaAhorro?: number; // Meta (solo para fondos de ahorro)
}

export interface UpdateFondoDto {
  nombre?: string;
  descripcion?: string;
  tipo?: TipoFondo;
  metaAhorro?: number; // Meta (solo para fondos de ahorro)
  activo?: boolean;
  // saldoActual no se actualiza directamente, solo via transacciones
}