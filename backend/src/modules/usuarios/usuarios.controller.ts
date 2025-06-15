import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Delete, 
  Body, 
  UseGuards,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { UpdateUsuarioDto } from '@/common/dto/usuario.dto';
import { Usuario, RolUsuario } from './schemas/usuario.schema';

@ApiTags('usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener todos los usuarios (solo admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida exitosamente',
    type: [Usuario]
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado - se requiere rol admin' 
  })
  async findAll(): Promise<Usuario[]> {
    return await this.usuariosService.findAll();
  }

  @Get('buscar')
  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Buscar usuarios por término (solo admin)' })
  @ApiQuery({ name: 'q', description: 'Término de búsqueda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda obtenidos exitosamente' 
  })
  async buscarUsuarios(@Query('q') termino: string): Promise<Usuario[]> {
    return await this.usuariosService.buscarUsuarios(termino);
  }

  @Get('estadisticas')
  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener estadísticas de usuarios (solo admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente' 
  })
  async obtenerEstadisticas() {
    return await this.usuariosService.obtenerEstadisticas();
  }

  @Get('mi-perfil')
  @ApiOperation({ summary: 'Obtener mi perfil de usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil obtenido exitosamente',
    type: Usuario
  })
  async obtenerMiPerfil(@GetUser('userId') userId: string): Promise<Usuario> {
    return await this.usuariosService.findOne(userId);
  }

  @Patch('mi-perfil')
  @ApiOperation({ summary: 'Actualizar mi perfil de usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil actualizado exitosamente',
    type: Usuario
  })
  async actualizarMiPerfil(
    @GetUser('userId') userId: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ): Promise<Usuario> {
    return await this.usuariosService.update(userId, updateUsuarioDto);
  }

  @Patch('mi-perfil/preferencias')
  @ApiOperation({ summary: 'Actualizar mis preferencias' })
  @ApiResponse({ 
    status: 200, 
    description: 'Preferencias actualizadas exitosamente' 
  })
  async actualizarMisPreferencias(
    @GetUser('userId') userId: string,
    @Body() preferencias: Partial<Usuario['preferencias']>
  ): Promise<Usuario> {
    return await this.usuariosService.updatePreferencias(userId, preferencias);
  }

  @Patch('mi-perfil/avatar')
  @ApiOperation({ summary: 'Actualizar mi avatar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Avatar actualizado exitosamente' 
  })
  async actualizarMiAvatar(
    @GetUser('userId') userId: string,
    @Body('avatarUrl') avatarUrl: string
  ): Promise<Usuario> {
    return await this.usuariosService.updateAvatar(userId, avatarUrl);
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Obtener usuario por ID (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado',
    type: Usuario
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async findOne(@Param('id') id: string): Promise<Usuario> {
    return await this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Actualizar usuario por ID (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente',
    type: Usuario
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async update(
    @Param('id') id: string, 
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ): Promise<Usuario> {
    return await this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch(':id/rol')
  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cambiar rol de usuario (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Rol cambiado exitosamente' 
  })
  async cambiarRol(
    @Param('id') id: string,
    @Body('rol') nuevoRol: RolUsuario
  ): Promise<Usuario> {
    return await this.usuariosService.cambiarRol(id, nuevoRol);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Eliminar usuario (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usuariosService.remove(id);
    return { message: 'Usuario eliminado exitosamente' };
  }
}
