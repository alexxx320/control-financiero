export interface ResumenFinanciero {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  fondosPorTipo: FondoResumen[];
  transaccionesPorCategoria: CategoriaResumen[];
  tendenciaMensual: TendenciaMensual[];
}

export interface FondoResumen {
  tipo: string;
  cantidad: number;
  montoTotal: number;
  progreso: number;
}

export interface CategoriaResumen {
  categoria: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  cantidad: number;
  porcentaje: number;
}

export interface TendenciaMensual {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

export interface EstadisticasDashboard {
  totalFondos: number;
  fondosActivos: number;
  transaccionesHoy: number;
  transaccionesMes: number;
  mayorGasto: number;
  mayorIngreso: number;
}
