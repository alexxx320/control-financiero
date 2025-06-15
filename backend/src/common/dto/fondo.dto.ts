import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoFondo } from '../interfaces/financiero.interface';

export class CreateFondoDto {
  @ApiProperty({
    description: 'Nombre del fondo',
    example: 'Fondo de Emergencia'
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del fondo',
    example: 'Fondo para emergencias médicas y gastos inesperados'
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de fondo',
    enum: TipoFondo,
    example: TipoFondo.EMERGENCIA
  })
  @IsEnum(TipoFondo)
  tipo: TipoFondo;

  @ApiProperty({
    description: 'Meta de ahorro para este fondo',
    example: 10000,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  metaAhorro: number;
}

export class UpdateFondoDto {
  @ApiPropertyOptional({
    description: 'Nombre del fondo',
    example: 'Fondo de Emergencia Actualizado'
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
  @IsEnum(TipoFondo)
  @IsOptional()
  tipo?: TipoFondo;

  @ApiPropertyOptional({
    description: 'Meta de ahorro para este fondo',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  metaAhorro?: number;

  @ApiPropertyOptional({
    description: 'Estado activo del fondo'
  })
  @IsOptional()
  activo?: boolean;
}
