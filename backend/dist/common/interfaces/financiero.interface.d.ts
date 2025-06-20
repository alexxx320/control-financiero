export declare enum TipoTransaccion {
    INGRESO = "ingreso",
    GASTO = "gasto"
}
export declare enum CategoriaTransaccion {
    ALIMENTACION = "alimentacion",
    TRANSPORTE = "transporte",
    ENTRETENIMIENTO = "entretenimiento",
    SALUD = "salud",
    EDUCACION = "educacion",
    HOGAR = "hogar",
    ROPA = "ropa",
    TECNOLOGIA = "tecnologia",
    VIAJES = "viajes",
    OTROS = "otros",
    SALARIO = "salario",
    FREELANCE = "freelance",
    INVERSIONES = "inversiones",
    REGALOS = "regalos"
}
export declare enum TipoFondo {
    AHORRO = "ahorro",
    INVERSION = "inversion",
    EMERGENCIA = "emergencia",
    GASTOS = "gastos",
    PERSONAL = "personal"
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
