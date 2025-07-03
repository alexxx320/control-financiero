import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsEnum, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum EstadoPrestamo {
  ACTIVO = 'activo',
  PAGADO = 'pagado',
  VENCIDO = 'vencido',
  PARCIAL = 'parcial'
}

export enum TipoPago {
  ABONO = 'abono',
  PAGO_TOTAL = 'pago_total'
}

export class CreatePrestamoDto {
  @IsNotEmpty()
  @IsString()
  fondoId: string;

  @IsNotEmpty()
  @IsString()
  nombreDeudor: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  montoOriginal: number;

  @IsOptional()
  @IsDateString()
  fechaPrestamo?: Date;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: Date;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdatePrestamoDto {
  @IsOptional()
  @IsString()
  nombreDeudor?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: Date;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(EstadoPrestamo)
  estado?: EstadoPrestamo;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CreatePagoPrestamoDto {
  @IsNotEmpty()
  @IsString()
  prestamoId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  monto: number;

  @IsOptional()
  @IsDateString()
  fechaPago?: Date;

  @IsOptional()
  @IsEnum(TipoPago)
  tipo?: TipoPago;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
