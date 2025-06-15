import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolUsuario } from '../../modules/usuarios/schemas/usuario.schema';

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com'
  })
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  @IsString({ message: 'Nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  @MaxLength(50, { message: 'Nombre no puede exceder 50 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  @IsString({ message: 'Apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Apellido es requerido' })
  @MaxLength(50, { message: 'Apellido no puede exceder 50 caracteres' })
  apellido: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiContraseña123!',
    minLength: 8
  })
  @IsString({ message: 'Contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Contraseña es requerida' })
  @MinLength(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+57 300 123 4567'
  })
  @IsString({ message: 'Teléfono debe ser una cadena de texto' })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: RolUsuario,
    default: RolUsuario.USUARIO
  })
  @IsEnum(RolUsuario, { message: 'Rol debe ser admin o usuario' })
  @IsOptional()
  rol?: RolUsuario;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com'
  })
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiContraseña123!'
  })
  @IsString({ message: 'Contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Contraseña es requerida' })
  password: string;
}

export class UpdateUsuarioDto {
  @ApiPropertyOptional({
    description: 'Nombre del usuario'
  })
  @IsString({ message: 'Nombre debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(50, { message: 'Nombre no puede exceder 50 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario'
  })
  @IsString({ message: 'Apellido debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(50, { message: 'Apellido no puede exceder 50 caracteres' })
  apellido?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario'
  })
  @IsString({ message: 'Teléfono debe ser una cadena de texto' })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'URL del avatar del usuario'
  })
  @IsString({ message: 'Avatar debe ser una cadena de texto' })
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Preferencias del usuario'
  })
  @IsOptional()
  preferencias?: {
    monedaPrincipal?: string;
    formatoFecha?: string;
    notificacionesEmail?: boolean;
    notificacionesAlertas?: boolean;
  };
}

export class CambiarPasswordDto {
  @ApiProperty({
    description: 'Contraseña actual',
    example: 'MiContraseñaVieja123!'
  })
  @IsString({ message: 'Contraseña actual debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Contraseña actual es requerida' })
  passwordActual: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'MiContraseñaNueva123!',
    minLength: 8
  })
  @IsString({ message: 'Nueva contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Nueva contraseña es requerida' })
  @MinLength(8, { message: 'Nueva contraseña debe tener al menos 8 caracteres' })
  passwordNueva: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'Información del usuario',
    type: Object
  })
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
  };

  @ApiProperty({
    description: 'Tiempo de expiración del token en segundos',
    example: 3600
  })
  expires_in: number;
}
