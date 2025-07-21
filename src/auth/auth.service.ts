import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationDto } from './dto/Validation.dto';
import { LoginDto } from './dto/Login.dto';
import * as bcrypt from 'bcrypt';
import { CreateJefeDto } from 'src/jefe/dto/create-jefe.dto';
import { CreateEmpleadoDto } from 'src/empleado/dto/create-empleado.dto';
import { CreateRegistroAsistenciaDto } from 'src/registro-asistencia/dto/create-registro-asistencia.dto';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto'; // Importa randomBytes para generar tokens de refresco

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, readonly prisma: PrismaService) {}

  /**
   * Valida las credenciales de un usuario (jefe) por nombre de usuario o correo y contraseña.
   * @param usernameOrEmail Nombre de usuario o correo del jefe.
   * @param contrasena Contraseña del jefe.
   * @returns Un objeto ValidationDto si las credenciales son válidas, de lo contrario undefined.
   */
  async validateUser(usernameOrEmail: string, contrasena: string): Promise<ValidationDto | undefined> {
    const user = await this.prisma.jefe.findFirst({
      where: {
        OR: [{ nombre: usernameOrEmail }, { correo: usernameOrEmail }],
      },
    });

    if (!user) return undefined;

    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (validPassword) {
      const { contrasena, ...result } = user; // Excluye la contraseña del resultado
      return result;
    }

    return undefined;
  }

  /**
   * Valida la existencia y el estado activo de un empleado por nombre de usuario o correo.
   * @param usernameOrEmail Nombre de usuario o correo del empleado.
   * @returns Un objeto de empleado si es válido y activo, de lo contrario undefined.
   */
  async validateEmpleado(usernameOrEmail: string): Promise<any | undefined> {
    return this.prisma.empleado.findFirst({
      where: {
        OR: [{ nombre: usernameOrEmail }, { correo: usernameOrEmail }],
        activo: true, // Solo empleados activos
      },
    });
  }

  /**
   * Genera un token de refresco y lo guarda en la base de datos.
   * @param userId ID del usuario (jefe o empleado).
   * @param userRole Rol del usuario ('jefe' o 'empleado').
   * @returns El token de refresco generado.
   */
  private async generateRefreshToken(userId: number, userRole: 'jefe' | 'empleado'): Promise<string> {
    const refreshToken = randomBytes(64).toString('hex'); // Genera un token aleatorio
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días (ajustable)

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        jefeId: userRole === 'jefe' ? userId : null,
        empleadoId: userRole === 'empleado' ? userId : null,
        expiresAt: expiresAt,
        isRevoked: false,
      },
    });

    return refreshToken;
  }

  /**
   * Inicia sesión para un jefe, generando un token de acceso y un token de refresco.
   * @param data DTO de inicio de sesión con credenciales.
   * @returns Un objeto que contiene el token de acceso, el token de refresco y los datos del usuario.
   */
  async login(data: LoginDto) {
    const user = await this.prisma.jefe.findFirst({
      where: {
        OR: [{ nombre: data.usernameOrEmail }, { correo: data.usernameOrEmail }],
      },
    });

    if (!user || !(await bcrypt.compare(data.contrasena, user.contrasena))) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = { id: user.id, nombre: user.nombre, role: 'jefe' };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id, 'jefe');

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        role: 'jefe',
      },
    };
  }

  /**
   * Inicia sesión para un empleado, generando un token de acceso y un token de refresco.
   * @param usernameOrEmail Nombre de usuario o correo del empleado.
   * @returns Un objeto que contiene el token de acceso, el token de refresco y los datos del empleado.
   */
  async loginEmpleado(usernameOrEmail: string) {
    const empleado = await this.validateEmpleado(usernameOrEmail);
    if (!empleado) throw new UnauthorizedException('Empleado no encontrado o inactivo.');

    const payload = { id: empleado.id, nombre: empleado.nombre, role: 'empleado' };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(empleado.id, 'empleado');

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: empleado.id,
        nombre: empleado.nombre,
        correo: empleado.correo,
        telefono: empleado.telefono,
        salario_hora: empleado.salario_hora,
        role: 'empleado',
      },
    };
  }

  /**
   * Crea un nuevo usuario jefe.
   * @param dto DTO para la creación de un jefe.
   * @returns El jefe creado.
   */
  async create(dto: CreateJefeDto) {
    const hashedPassword = await bcrypt.hash(dto.contrasena, 10);
    return this.prisma.jefe.create({
      data: {
        correo: dto.correo,
        nombre: dto.nombre,
        contrasena: hashedPassword,
      },
    });
  }

  /**
   * Autentica a un empleado por su ID, generando un token de acceso.
   * @param empleado_id ID del empleado.
   * @returns Un objeto que contiene el token de acceso y los datos del empleado.
   */
  async autenticarEmpleadoPorId(empleado_id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleado_id, activo: true },
    });

    if (!empleado) throw new UnauthorizedException('Empleado no encontrado o inactivo.');

    const payload = { id: empleado.id, nombre: empleado.nombre, role: 'empleado' };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(empleado.id, 'empleado');


    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: empleado.id,
        nombre: empleado.nombre,
        correo: empleado.correo,
        telefono: empleado.telefono,
        salario_hora: empleado.salario_hora,
        role: 'empleado',
      },
    };
  }

  /**
   * Crea un nuevo empleado asociado a un jefe.
   * @param dto DTO para la creación de un empleado.
   * @returns El empleado creado.
   */
  async createEmpleado(dto: CreateEmpleadoDto) {
    const jefe_id = typeof dto.jefe_id === 'string' ? parseInt(dto.jefe_id) : dto.jefe_id;

    const jefe = await this.prisma.jefe.findUnique({ where: { id: jefe_id } });
    if (!jefe) throw new BadRequestException('El jefe especificado no existe.');

    const empleadoExistente = await this.prisma.empleado.findFirst({
      where: {
        OR: [{ correo: dto.correo }, { nombre: dto.nombre }],
      },
    });

    if (empleadoExistente) throw new BadRequestException('Ya existe un empleado con ese correo o nombre.');

    return this.prisma.empleado.create({
      data: {
        nombre: dto.nombre,
        telefono: dto.telefono,
        correo: dto.correo,
        salario_hora: dto.salario_hora,
        activo: dto.activo,
        jefe_id,
      },
    });
  }

  /**
   * Registra o actualiza la asistencia de un empleado.
   * @param dto DTO con los datos de asistencia.
   * @returns El registro de asistencia creado o actualizado.
   */
  async registrarAsistencia(dto: CreateRegistroAsistenciaDto) {
    const empleado = await this.prisma.empleado.findUnique({ where: { id: dto.empleado_id } });
    if (!empleado || !empleado.activo) throw new BadRequestException('Empleado no encontrado o inactivo.');

    const fechaInicio = new Date(dto.fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(dto.fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const registroExistente = await this.prisma.registroAsistencia.findFirst({
      where: {
        empleado_id: dto.empleado_id,
        fecha: { gte: fechaInicio, lte: fechaFin },
      },
    });

    let horas_trabajadas = 0;
    if (dto.hora_entrada && dto.hora_salida) {
      const entrada = new Date(dto.hora_entrada);
      const salida = new Date(dto.hora_salida);
      horas_trabajadas = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60);
    }

    const salario_calculado = horas_trabajadas * empleado.salario_hora;

    const data: any = {
      horas_trabajadas,
      salario_calculado,
    };

    if (dto.hora_entrada != null) data.hora_entrada = dto.hora_entrada;
    if (dto.hora_salida != null) data.hora_salida = dto.hora_salida;

    if (registroExistente) {
      return this.prisma.registroAsistencia.update({
        where: { id: registroExistente.id },
        data,
      });
    } else {
      return this.prisma.registroAsistencia.create({
        data: {
          empleado_id: dto.empleado_id,
          fecha: dto.fecha,
          ...data,
        },
      });
    }
  }

  /**
   * Registra la hora de entrada de un empleado.
   * @param empleado_id ID del empleado.
   * @returns El registro de asistencia actualizado o creado.
   */
  async registrarEntrada(empleado_id: number) {
    const ahora = new Date();
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    const registroExistente = await this.prisma.registroAsistencia.findFirst({
      where: {
        empleado_id,
        fecha: {
          gte: fechaHoy,
          lt: new Date(fechaHoy.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (registroExistente?.hora_entrada) {
      throw new BadRequestException('Ya se registró la entrada para hoy.');
    }

    const empleado = await this.prisma.empleado.findUnique({ where: { id: empleado_id } });
    if (!empleado || !empleado.activo) throw new BadRequestException('Empleado no encontrado o inactivo.');

    if (registroExistente) {
      return this.prisma.registroAsistencia.update({
        where: { id: registroExistente.id },
        data: {
          hora_entrada: ahora,
          horas_trabajadas: 0,
          salario_calculado: 0,
        },
      });
    }

    return this.prisma.registroAsistencia.create({
      data: {
        empleado_id,
        fecha: fechaHoy,
        hora_entrada: ahora,
        horas_trabajadas: 0,
        salario_calculado: 0,
      },
    });
  }

  /**
   * Registra la hora de salida de un empleado y calcula las horas trabajadas y el salario.
   * @param empleado_id ID del empleado.
   * @returns El registro de asistencia actualizado.
   */
  async registrarSalida(empleado_id: number) {
    const ahora = new Date();
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    const registroExistente = await this.prisma.registroAsistencia.findFirst({
      where: {
        empleado_id,
        fecha: {
          gte: fechaHoy,
          lt: new Date(fechaHoy.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!registroExistente?.hora_entrada) {
      throw new BadRequestException('Debe registrar la entrada primero.');
    }

    if (registroExistente.hora_salida) {
      throw new BadRequestException('Ya se registró la salida para hoy.');
    }

    const empleado = await this.prisma.empleado.findUnique({ where: { id: empleado_id } });
    if (!empleado) throw new BadRequestException('Empleado no encontrado.');

    const horas_trabajadas = (ahora.getTime() - registroExistente.hora_entrada.getTime()) / (1000 * 60 * 60);
    const salario_calculado = horas_trabajadas * empleado.salario_hora;

    return this.prisma.registroAsistencia.update({
      where: { id: registroExistente.id },
      data: {
        hora_salida: ahora,
        horas_trabajadas,
        salario_calculado,
      },
    });
  }

  /**
   * Genera un token QR para el registro de asistencia de un empleado.
   * Invalida los tokens QR no usados y no expirados previamente para el mismo empleado.
   * @param empleado_id ID del empleado.
   * @returns Los datos del token QR generado, incluyendo la URL del código QR.
   */
  async generarQRToken(empleado_id: number) {
    const empleado = await this.prisma.empleado.findUnique({ where: { id: empleado_id } });
    if (!empleado || !empleado.activo) {
      throw new BadRequestException('Empleado no encontrado o inactivo.');
    }

    // Invalida tokens QR anteriores no usados y no expirados para este empleado
    await this.prisma.qRToken.updateMany({
      where: {
        empleado_id,
        usado: false,
        expira_en: { gt: new Date() },
      },
      data: { usado: true },
    });

    const token = uuidv4(); // Genera un UUID para el token
    const ahora = new Date();
    const expira_en = new Date(ahora.getTime() + 5 * 60 * 1000); // Expira en 5 minutos

    const qrData = JSON.stringify({
      token,
      empleado_id,
      timestamp: ahora.toISOString(),
    });

    const qrCode = await QRCode.toDataURL(qrData); // Genera la imagen del QR en base64

    return this.prisma.qRToken.create({
      data: {
        token,
        empleado_id,
        creado_en: ahora,
        expira_en,
        usado: false,
        qrCode,
      },
    });
  }

  /**
   * Valida un token QR.
   * @param token El token QR a validar.
   * @returns El token QR validado con los datos del empleado.
   */
  async validarQRToken(token: string) {
    const qrToken = await this.prisma.qRToken.findFirst({
      where: {
        token,
        usado: false,
        expira_en: { gt: new Date() }, // El token no debe haber expirado
      },
      include: {
        empleado: true, // Incluye los datos del empleado asociado
      },
    });

    if (!qrToken) throw new BadRequestException('Token QR inválido o expirado.');

    // Marca el token como usado para evitar reuso
    await this.prisma.qRToken.update({
      where: { id: qrToken.id },
      data: { usado: true },
    });

    return qrToken;
  }

  /**
   * Registra la asistencia (entrada o salida) utilizando un token QR.
   * @param token El token QR.
   * @param tipo Tipo de registro ('entrada' o 'salida').
   * @returns El registro de asistencia.
   */
  async registrarAsistenciaConQR(token: string, tipo: 'entrada' | 'salida') {
    const qrToken = await this.validarQRToken(token);
    return tipo === 'entrada'
      ? this.registrarEntrada(qrToken.empleado_id)
      : this.registrarSalida(qrToken.empleado_id);
  }

  /**
   * Obtiene el historial de asistencia de un empleado.
   * @param empleado_id ID del empleado.
   * @param fecha_inicio Fecha de inicio opcional para filtrar.
   * @param fecha_fin Fecha de fin opcional para filtrar.
   * @returns Una lista de registros de asistencia.
   */
  async obtenerHistorialAsistencia(empleado_id: number, fecha_inicio?: Date, fecha_fin?: Date) {
    const where: any = { empleado_id };

    if (fecha_inicio || fecha_fin) {
      where.fecha = {};
      if (fecha_inicio) where.fecha.gte = fecha_inicio;
      if (fecha_fin) where.fecha.lte = fecha_fin;
    }

    return this.prisma.registroAsistencia.findMany({
      where,
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            correo: true,
            salario_hora: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Obtiene la lista de empleados asociados a un jefe, incluyendo sus asistencias recientes.
   * @param jefe_id ID del jefe.
   * @returns Una lista de empleados.
   */
  async obtenerEmpleadosJefe(jefe_id: number) {
    return this.prisma.empleado.findMany({
      where: { jefe_id },
      include: {
        asistencias: { // Ajusta aquí según el nombre real de la relación en tu schema.prisma
          where: {
            fecha: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Asistencias de los últimos 30 días
            },
          },
          orderBy: { fecha: 'desc' },
        },
      },
    });
  }

  /**
   * Maneja la solicitud de refresco de tokens.
   * Valida el token de refresco proporcionado y emite un nuevo token de acceso (y un nuevo token de refresco).
   * @param refreshToken El token de refresco enviado por el cliente.
   * @returns Un objeto con el nuevo access_token y refresh_token.
   */
  async refreshTokens(refreshToken: string) {
    // Busca el token de refresco en la base de datos
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        isRevoked: false, // Asegura que no esté revocado
        expiresAt: { gt: new Date() }, // Asegura que no haya expirado
      },
      include: {
        jefe: true,
        empleado: true,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Token de refresco inválido o expirado.');
    }

    // Revoca el token de refresco actual para evitar reuso
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    let payload: { id: number; nombre: string; role: 'jefe' | 'empleado' };
    let newRefreshToken: string;

    if (storedToken.jefe) {
      payload = { id: storedToken.jefe.id, nombre: storedToken.jefe.nombre, role: 'jefe' };
      newRefreshToken = await this.generateRefreshToken(storedToken.jefe.id, 'jefe');
    } else if (storedToken.empleado) {
      payload = { id: storedToken.empleado.id, nombre: storedToken.empleado.nombre, role: 'empleado' };
      newRefreshToken = await this.generateRefreshToken(storedToken.empleado.id, 'empleado');
    } else {
      throw new UnauthorizedException('Usuario asociado al token de refresco no encontrado.');
    }

    const newAccessToken = this.jwtService.sign(payload);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }
}