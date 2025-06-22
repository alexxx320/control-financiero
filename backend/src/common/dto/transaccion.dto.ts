import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, Max, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoTransaccion, CategoriaTransaccion } from '../interfaces/financiero.interface';

export class CreateTransaccionDto {
  @ApiProperty({
    description: 'ID del fondo al que pertenece la transacción',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsNotEmpty()
  fondoId: string;

  @ApiProperty({
    description: 'Descripción de la transacción',
    example: 'Compra de supermercado'
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Monto de la transacción',
    example: 1500.50,
    minimum: 0.01
  })
  @IsNumber()
  @Min(0.01)
  monto: number;

  @ApiProperty({
    description: 'Tipo de transacción',
    enum: TipoTransaccion,
    example: TipoTransaccion.GASTO
  })
  @IsEnum(TipoTransaccion)
  tipo: TipoTransaccion;

  @ApiProperty({
    description: 'Categoría de la transacción',
    enum: CategoriaTransaccion,
    example: CategoriaTransaccion.NECESARIO
  })
  @IsEnum(CategoriaTransaccion)
  categoria: CategoriaTransaccion;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la transacción',
    example: 'Compra semanal en el supermercado'
  })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiPropertyOptional({
    description: 'Etiquetas para categorizar la transacción',
    example: ['supermercado', 'semanal'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  etiquetas?: string[];

  @ApiPropertyOptional({
    description: 'Fecha de la transacción',
    example: '2024-06-20T05:00:00.000Z',
    type: Date
  })
  @IsOptional()
  fecha?: Date;
}

export class UpdateTransaccionDto {
  @ApiPropertyOptional({
    description: 'ID del fondo al que pertenece la transacción'
  })
  @IsString()
  @IsOptional()
  fondoId?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la transacción'
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Monto de la transacción',
    minimum: 0.01
  })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  monto?: number;

  @ApiPropertyOptional({
    description: 'Tipo de transacción',
    enum: TipoTransaccion
  })
  @IsEnum(TipoTransaccion)
  @IsOptional()
  tipo?: TipoTransaccion;

  @ApiPropertyOptional({
    description: 'Categoría de la transacción',
    enum: CategoriaTransaccion
  })
  @IsEnum(CategoriaTransaccion)
  @IsOptional()
  categoria?: CategoriaTransaccion;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la transacción'
  })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiPropertyOptional({
    description: 'Etiquetas para categorizar la transacción',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  etiquetas?: string[];

  @ApiPropertyOptional({
    description: 'Fecha de la transacción'
  })
  @IsOptional()
  fecha?: Date;
}

export class FiltroTransaccionesDto {
  @ApiPropertyOptional({
    description: 'ID del fondo para filtrar transacciones',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsOptional()
  fondoId?: string;

  @ApiPropertyOptional({
    description: 'Tipo de transacción a filtrar',
    enum: TipoTransaccion
  })
  @IsEnum(TipoTransaccion)
  @IsOptional()
  tipo?: TipoTransaccion;

  @ApiPropertyOptional({
    description: 'Categoría a filtrar',
    enum: CategoriaTransaccion
  })
  @IsEnum(CategoriaTransaccion)
  @IsOptional()
  categoria?: CategoriaTransaccion;

  @ApiPropertyOptional({
    description: 'Fecha específica (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @IsOptional()
  fecha?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para el filtro (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para el filtro (YYYY-MM-DD)',
    example: '2024-12-31'
  })
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Monto mínimo',
    minimum: 0
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  montoMin?: number;

  @ApiPropertyOptional({
    description: 'Monto máximo',
    minimum: 0
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  montoMax?: number;

  @ApiPropertyOptional({
    description: 'Página para paginación',
    minimum: 1,
    default: 1
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Página para paginación (alias)',
    minimum: 1,
    default: 1
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  pagina?: number;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página (alias)',
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limite?: number;
}
