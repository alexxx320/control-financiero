import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Patch,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { 
  CreateUsuarioDto, 
  LoginDto, 
  AuthResponseDto,
  CambiarPasswordDto 
} from '@/common/dto/usuario.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('registro')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o email ya existe' 
  })
  async registro(@Body() createUsuarioDto: CreateUsuarioDto): Promise<AuthResponseDto> {
    return await this.authService.registro(createUsuarioDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas' 
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil obtenido exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autenticado' 
  })
  async obtenerPerfil(@GetUser() user: any) {
    console.log('Usuario completo del token:', user);
    
    return {
      id: user.userId,
      email: user.email,
      nombre: user.usuario.nombre,
      apellido: user.usuario.apellido,
      rol: user.rol,
      telefono: user.usuario.telefono,
      avatar: user.usuario.avatar,
      preferencias: user.usuario.preferencias,
      fechaRegistro: user.usuario.fechaRegistro,
      ultimoLogin: user.usuario.ultimoLogin,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('renovar-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado exitosamente',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido' 
  })
  async renovarToken(@GetUser('userId') userId: string): Promise<AuthResponseDto> {
    return await this.authService.renovarToken(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cambiar-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña cambiada exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Contraseña actual incorrecta' 
  })
  async cambiarPassword(
    @GetUser('userId') userId: string,
    @Body() cambiarPasswordDto: CambiarPasswordDto
  ): Promise<{ message: string }> {
    await this.authService.cambiarPassword(
      userId, 
      cambiarPasswordDto.passwordActual, 
      cambiarPasswordDto.passwordNueva
    );
    return { message: 'Contraseña cambiada exitosamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesión cerrada exitosamente' 
  })
  async logout(): Promise<{ message: string }> {
    // En una implementación real, aquí podrías invalidar el token
    // agregándolo a una lista negra en Redis o base de datos
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Public()
  @Post('verificar-email')
  @ApiOperation({ summary: 'Verificar si un email está disponible' })
  @ApiResponse({ 
    status: 200, 
    description: 'Verificación completada' 
  })
  async verificarEmail(@Body('email') email: string): Promise<{ disponible: boolean }> {
    try {
      await this.authService.obtenerUsuarioPorEmail(email);
      return { disponible: false };
    } catch (error) {
      return { disponible: true };
    }
  }
}
