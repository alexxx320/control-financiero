export declare enum TipoTransaccion {
    INGRESO = "ingreso",
    GASTO = "gasto"
}
export declare enum CategoriaTransaccion {
    NECESARIO = "necesario",
    NO_NECESARIO = "no_necesario",
    SALARIO = "salario",
    REGALO = "regalo",
    OTROS = "otros"
}
export declare enum TipoFondo {
    REGISTRO = "registro",
    AHORRO = "ahorro"
}
export declare enum TipoAlerta {
    INFO = "info",
    ADVERTENCIA = "advertencia",
    ERROR = "error",
    EXITO = "exito"
}
export declare enum PrioridadAlerta {
    BAJA = "baja",
    MEDIA = "media",
    ALTA = "alta"
}
export interface IFondo {
    id?: string;
    nombre: string;
    descripcion?: string;
    tipo: TipoFondo;
    metaAhorro: number;
    fechaCreacion: Date;
    activo: boolean;
}
export interface ITransaccion {
    id?: string;
    fondoId: string;
    descripcion: string;
    monto: number;
    tipo: TipoTransaccion;
    categoria: CategoriaTransaccion;
    fecha: Date;
    notas?: string;
    etiquetas?: string[];
}
export interface IReporteMensual {
    periodo: string;
    mes: number;
    año: number;
    fondos: IReporteFondo[];
    resumen: IResumenPeriodo;
}
export interface IReporteFondo {
    nombre: string;
    balanceInicial: number;
    ingresos: number;
    gastos: number;
    balanceNeto: number;
    balanceFinal: number;
    transacciones: number;
}
export interface IResumenPeriodo {
    totalIngresos: number;
    totalGastos: number;
    balanceNeto: number;
    transaccionesTotales: number;
}
export interface IAlerta {
    tipo: TipoAlerta;
    fondo: string;
    mensaje: string;
    prioridad: PrioridadAlerta;
}
export interface IEstadisticas {
    totalFondos: number;
    totalTransacciones: number;
    balanceTotal: number;
    fondoMayorBalance: string;
    categoriaFrecuente: CategoriaTransaccion;
    promedioGastoMensual: number;
}
