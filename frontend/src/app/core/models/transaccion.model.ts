export type TipoTransaccion = 'ingreso' | 'gasto';

export type CategoriaTransaccion = 
  // Categorías de gastos
  | 'necesario'
  | 'no_necesario'
  // Categorías de ingresos
  | 'salario'
  | 'regalo'
  | 'otros'
  // Categoría para transferencias
  | 'transferencia';

export interface Transaccion {
  _id?: string;
  fondoId: string;
  fondoDestinoId?: string; // Para transferencias
  _fondoNombre?: string; // Campo para el nombre del fondo cuando viene populado
  _fondoDestinoNombre?: string; // Campo para el nombre del fondo destino cuando viene populado
  descripcion: string;
  monto: number;
  tipo: TipoTransaccion;
  categoria: CategoriaTransaccion;
  fecha: Date | string;
  notas?: string;
  etiquetas?: string[];
  comprobante?: string; // URL del comprobante/factura
  ubicacion?: {
    nombre: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
  };
  recurrente?: {
    activa: boolean;
    frecuencia: 'diaria' | 'semanal' | 'quincenal' | 'mensual' | 'anual';
    fechaFin?: Date;
  };
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface CreateTransaccionDto {
  fondoId: string;
  descripcion: string;
  monto: number;
  tipo: TipoTransaccion;
  categoria: CategoriaTransaccion;
  fecha: Date | string;
  notas?: string;
  etiquetas?: string[];
  comprobante?: string;
  ubicacion?: {
    nombre: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
  };
  recurrente?: {
    activa: boolean;
    frecuencia: 'diaria' | 'semanal' | 'quincenal' | 'mensual' | 'anual';
    fechaFin?: Date;
  };
}

export interface UpdateTransaccionDto extends Partial<CreateTransaccionDto> {}

export interface FiltroTransacciones {
  busqueda?: string;
  fondoId?: string;
  tipo?: TipoTransaccion;
  categoria?: CategoriaTransaccion;
  fechaInicio?: string;
  fechaFin?: string;
  montoMin?: number;
  montoMax?: number;
  etiquetas?: string[];
  page?: number;
  limit?: number;
  ordenarPor?: 'fecha' | 'monto' | 'descripcion';
  orden?: 'asc' | 'desc';
}

export interface ResponseTransacciones {
  transacciones: Transaccion[];
  total: number;
  page: number;
  totalPages: number;
  resumen?: {
    totalIngresos: number;
    totalGastos: number;
    balance: number;
    transaccionesPorCategoria: {
      categoria: string;
      cantidad: number;
      monto: number;
    }[];
  };
}

// Interfaz específica para transferencias
export interface CreateTransferenciaDto {
  fondoOrigenId: string;
  fondoDestinoId: string;
  monto: number;
  descripcion: string;
  notas?: string;
  fecha?: Date | string;
}

export interface ResponseTransferencia {
  transaccionOrigen: Transaccion;
  transaccionDestino: Transaccion;
}

export interface EstadisticasTransacciones {
  totalTransacciones: number;
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  promedioTransacciones: number;
  categoriaMaxGasto: {
    categoria: string;
    monto: number;
  };
  categoriaMaxIngreso: {
    categoria: string;
    monto: number;
  };
  tendenciaMensual: {
    mes: string;
    ingresos: number;
    gastos: number;
    balance: number;
  }[];
}
