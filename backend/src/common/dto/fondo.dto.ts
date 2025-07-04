import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoFondo } from '../interfaces/financiero.interface';

export class CreateFondoDto {
  @ApiProperty({
    description: 'Nombre del fondo',
    example: 'Mi Fondo de Ahorro'
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del fondo',
    example: 'Fondo para ahorrar para vacaciones'
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de fondo',
    enum: TipoFondo,
    example: TipoFondo.AHORRO,
    enumName: 'TipoFondo'
  })
  @IsEnum(TipoFondo, {
    message: 'El tipo debe ser "registro", "ahorro", "prestamo" o "deuda"'
  })
  tipo: TipoFondo;

  @ApiPropertyOptional({
    description: 'Saldo inicial del fondo (puede ser negativo para préstamos)',
    example: 0,
    default: 0
  })
  @IsNumber()
  @IsOptional()
  saldoActual?: number;

  @ApiPropertyOptional({
    description: 'Meta de ahorro (obligatoria para fondos tipo "ahorro")',
    example: 100000,
    minimum: 1
  })
  @ValidateIf(o => o.tipo === TipoFondo.AHORRO || o.tipo === TipoFondo.PRESTAMO || o.tipo === TipoFondo.DEUDA)
  @IsNumber({}, {
    message: 'La meta debe ser un número válido para fondos de ahorro, préstamos y deudas'
  })
  @Min(1, {
    message: 'La meta debe ser mayor a 0 para fondos de ahorro, préstamos y deudas'
  })
  @IsNotEmpty({
    message: 'La meta es obligatoria para fondos de ahorro, préstamos y deudas'
  })
  metaAhorro?: number;
}

export class UpdateFondoDto {
  @ApiPropertyOptional({
    description: 'Nombre del fondo',
    example: 'Mi Fondo Actualizado'
  })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Descripción del fondo'
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Tipo de fondo',
    enum: TipoFondo
  })
  @IsEnum(TipoFondo, {
    message: 'El tipo debe ser "registro", "ahorro", "prestamo" o "deuda"'
  })
  @IsOptional()
  tipo?: TipoFondo;

  @ApiPropertyOptional({
    description: 'Meta de ahorro (obligatoria para fondos tipo "ahorro")',
    minimum: 1
  })
  @ValidateIf(o => o.tipo === TipoFondo.AHORRO || o.tipo === TipoFondo.PRESTAMO || o.tipo === TipoFondo.DEUDA || (!o.tipo))
  @IsNumber({}, {
    message: 'La meta debe ser un número válido'
  })
  @Min(1, {
    message: 'La meta debe ser mayor a 0 para fondos de ahorro, préstamos y deudas'
  })
  @IsNotEmpty({
    message: 'La meta es obligatoria para fondos de ahorro, préstamos y deudas'
  })
  metaAhorro?: number;

  @ApiPropertyOptional({
    description: 'Estado activo del fondo'
  })
  @IsOptional()
  activo?: boolean;
}
