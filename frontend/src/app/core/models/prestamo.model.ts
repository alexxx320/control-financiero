export interface Prestamo {
  _id?: string;
  fondoId: string;
  nombreDeudor: string;
  contacto?: string;
  montoOriginal: number;
  montoAbonado: number;
  fechaPrestamo: Date;
  fechaVencimiento?: Date;
  descripcion?: string;
  estado: EstadoPrestamo;
  notas?: string;
  activo?: boolean;
  saldoPendiente?: number; // Campo calculado
  porcentajePagado?: number; // Campo calculado
}

export type EstadoPrestamo = 'activo' | 'pagado' | 'vencido' | 'parcial';

export interface PagoPrestamo {
  _id?: string;
  prestamoId: string;
  fondoId: string;
  monto: number;
  fechaPago: Date;
  tipo: TipoPago;
  descripcion?: string;
  notas?: string;
  activo?: boolean;
}

export type TipoPago = 'abono' | 'pago_total';

export interface CreatePrestamoDto {
  fondoId: string;
  nombreDeudor: string;
  contacto?: string;
  montoOriginal: number;
  fechaPrestamo?: Date;
  fechaVencimiento?: Date;
  descripcion?: string;
  notas?: string;
}

export interface UpdatePrestamoDto {
  nombreDeudor?: string;
  contacto?: string;
  fechaVencimiento?: Date;
  descripcion?: string;
  estado?: EstadoPrestamo;
  notas?: string;
  activo?: boolean;
}

export interface CreatePagoPrestamoDto {
  prestamoId: string;
  monto: number;
  fechaPago?: Date;
  tipo?: TipoPago;
  descripcion?: string;
  notas?: string;
}

// Interface para estadísticas de préstamos
export interface EstadisticasPrestamos {
  totalPrestamos: number;
  prestamosActivos: number;
  prestamosPagados: number;
  prestamosVencidos: number;
  montoTotalPrestado: number;
  montoTotalRecuperado: number;
  saldoPendienteTotal: number;
  porcentajeRecuperacion: number;
}

// Interface para el resumen de un deudor
export interface ResumenDeudor {
  nombreDeudor: string;
  totalPrestamos: number;
  montoTotalPrestado: number;
  montoTotalAbonado: number;
  saldoPendiente: number;
  prestamos: Prestamo[];
  ultimoPago?: Date;
}
