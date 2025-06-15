import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, Max, IsArray } from 'class-validator';
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
    example: CategoriaTransaccion.ALIMENTACION
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
}

export class UpdateTransaccionDto {
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
}

export class FiltroTransaccionesDto {
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
  @IsNumber()
  @Min(0)
  @IsOptional()
  montoMin?: number;

  @ApiPropertyOptional({
    description: 'Monto máximo',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  montoMax?: number;

  @ApiPropertyOptional({
    description: 'Página para paginación',
    minimum: 1,
    default: 1
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  pagina?: number;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limite?: number;
}
