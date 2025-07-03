export declare enum EstadoPrestamo {
    ACTIVO = "activo",
    PAGADO = "pagado",
    VENCIDO = "vencido",
    PARCIAL = "parcial"
}
export declare enum TipoPago {
    ABONO = "abono",
    PAGO_TOTAL = "pago_total"
}
export declare class CreatePrestamoDto {
    fondoId: string;
    nombreDeudor: string;
    contacto?: string;
    montoOriginal: number;
    fechaPrestamo?: Date;
    fechaVencimiento?: Date;
    descripcion?: string;
    notas?: string;
}
export declare class UpdatePrestamoDto {
    nombreDeudor?: string;
    contacto?: string;
    fechaVencimiento?: Date;
    descripcion?: string;
    estado?: EstadoPrestamo;
    notas?: string;
    activo?: boolean;
}
export declare class CreatePagoPrestamoDto {
    prestamoId: string;
    monto: number;
    fechaPago?: Date;
    tipo?: TipoPago;
    descripcion?: string;
    notas?: string;
}
