import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario, UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { CreateUsuarioDto, LoginDto, AuthResponseDto } from '@/common/dto/usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private jwtService: JwtService,
  ) {}

  async registro(createUsuarioDto: CreateUsuarioDto): Promise<AuthResponseDto> {
    // Verificar si el usuario ya existe
    const usuarioExistente = await this.usuarioModel.findOne({ 
      email: createUsuarioDto.email.toLowerCase() 
    });

    if (usuarioExistente) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(createUsuarioDto.password, saltRounds);

    // Crear usuario
    const nuevoUsuario = new this.usuarioModel({
      ...createUsuarioDto,
      email: createUsuarioDto.email.toLowerCase(),
      password: passwordHash,
      fechaRegistro: new Date(),
    });

    const usuarioGuardado = await nuevoUsuario.save();

    // Generar token
    const payload = { 
      sub: usuarioGuardado._id.toString(), 
      email: usuarioGuardado.email,
      rol: usuarioGuardado.rol 
    };

    const access_token = this.jwtService.sign(payload);

    // Actualizar último login
    await this.usuarioModel.findByIdAndUpdate(usuarioGuardado._id, {
      ultimoLogin: new Date()
    });

    return {
      access_token,
      usuario: {
        id: usuarioGuardado._id.toString(),
        email: usuarioGuardado.email,
        nombre: usuarioGuardado.nombre,
        apellido: usuarioGuardado.apellido,
        rol: usuarioGuardado.rol,
      },
      expires_in: 3600, // 1 hora
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    console.log('AuthService - Intentando login para:', loginDto.email);
    
    // Buscar usuario por email
    const usuario = await this.usuarioModel.findOne({ 
      email: loginDto.email.toLowerCase(),
      activo: true 
    });

    if (!usuario) {
      console.error('Usuario no encontrado:', loginDto.email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(loginDto.password, usuario.password);

    if (!passwordValida) {
      console.error('Contraseña inválida para:', loginDto.email);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('Login exitoso para usuario:', {
      id: usuario._id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    });

    // Generar token
    const payload = { 
      sub: usuario._id.toString(), 
      email: usuario.email,
      rol: usuario.rol 
    };

    console.log('Payload para JWT:', payload);
    const access_token = this.jwtService.sign(payload);
    console.log('Token generado (primeros 20 chars):', access_token.substring(0, 20));

    // Actualizar último login
    await this.usuarioModel.findByIdAndUpdate(usuario._id, {
      ultimoLogin: new Date()
    });

    const response = {
      access_token,
      usuario: {
        id: usuario._id.toString(),
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
      expires_in: 3600, // 1 hora
    };
    
    console.log('Respuesta de login:', response);
    return response;
  }

  async validarUsuario(email: string, password: string): Promise<any> {
    const usuario = await this.usuarioModel.findOne({ 
      email: email.toLowerCase(),
      activo: true 
    });

    if (usuario && await bcrypt.compare(password, usuario.password)) {
      const { password, ...resultado } = usuario.toObject();
      return resultado;
    }
    return null;
  }

  async obtenerUsuarioPorId(userId: string): Promise<UsuarioDocument> {
    console.log('AuthService - Buscando usuario por ID:', userId);
    
    const usuario = await this.usuarioModel
      .findById(userId)
      .select('-password') // No excluyas _id
      .exec();

    if (!usuario) {
      console.error('Usuario no encontrado con ID:', userId);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    console.log('AuthService - Usuario encontrado:', {
      id: usuario._id,
      email: usuario.email,
      nombre: usuario.nombre
    });
    
    return usuario as UsuarioDocument;
  }

  async verificarToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const usuario = await this.obtenerUsuarioPorId(payload.sub);
      return usuario;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async cambiarPassword(userId: string, passwordActual: string, passwordNueva: string): Promise<void> {
    const usuario = await this.usuarioModel.findById(userId);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);

    if (!passwordValida) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Encriptar nueva contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(passwordNueva, saltRounds);

    // Actualizar contraseña
    await this.usuarioModel.findByIdAndUpdate(userId, {
      password: passwordHash
    });
  }

  async obtenerUsuarioPorEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuarioModel
      .findOne({ email: email.toLowerCase() })
      .select('-password')
      .exec();

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return usuario;
  }

  async renovarToken(userId: string): Promise<AuthResponseDto> {
    const usuario = await this.obtenerUsuarioPorId(userId);

    const payload = { 
      sub: usuario._id.toString(), 
      email: usuario.email,
      rol: usuario.rol 
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      usuario: {
        id: usuario._id.toString(),
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
      expires_in: 3600,
    };
  }
}
