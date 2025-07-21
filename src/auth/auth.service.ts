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

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, readonly prisma: PrismaService) {}

  async validateUser(usernameOrEmail: string, contrasena: string): Promise<ValidationDto | undefined> {
    const user = await this.prisma.jefe.findFirst({
      where: {
        OR: [{ nombre: usernameOrEmail }, { correo: usernameOrEmail }],
      },
    });

    if (!user) return undefined;

    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (validPassword) {
      const { contrasena, ...result } = user;
      return result;
    }

    return undefined;
  }

  async validateEmpleado(usernameOrEmail: string): Promise<any | undefined> {
    return this.prisma.empleado.findFirst({
      where: {
        OR: [{ nombre: usernameOrEmail }, { correo: usernameOrEmail }],
        activo: true,
      },
    });
  }

  async login(data: LoginDto) {
    const user = await this.prisma.jefe.findFirst({
      where: {
        OR: [{ nombre: data.usernameOrEmail }, { correo: data.usernameOrEmail }],
      },
    });

    if (!user || !(await bcrypt.compare(data.contrasena, user.contrasena))) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const payload = { id: user.id, nombre: user.nombre, role: 'jefe' };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        role: 'jefe',
      },
    };
  }

  async loginEmpleado(usernameOrEmail: string) {
    const empleado = await this.validateEmpleado(usernameOrEmail);
    if (!empleado) throw new UnauthorizedException('Empleado no encontrado o inactivo.');

    const payload = { id: empleado.id, nombre: empleado.nombre, role: 'empleado' };

    return {
      access_token: this.jwtService.sign(payload),
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

  async autenticarEmpleadoPorId(empleado_id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleado_id, activo: true },
    });

    if (!empleado) throw new UnauthorizedException('Empleado no encontrado o inactivo.');

    const payload = { id: empleado.id, nombre: empleado.nombre, role: 'empleado' };

    return {
      access_token: this.jwtService.sign(payload),
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

  async generarQRToken(empleado_id: number) {
    const empleado = await this.prisma.empleado.findUnique({ where: { id: empleado_id } });
    if (!empleado || !empleado.activo) {
      throw new BadRequestException('Empleado no encontrado o inactivo.');
    }

    await this.prisma.qRToken.updateMany({
      where: {
        empleado_id,
        usado: false,
        expira_en: { gt: new Date() },
      },
      data: { usado: true },
    });

    const token = uuidv4();
    const ahora = new Date();
    const expira_en = new Date(ahora.getTime() + 5 * 60 * 1000);

    const qrData = JSON.stringify({
      token,
      empleado_id,
      timestamp: ahora.toISOString(),
    });

    const qrCode = await QRCode.toDataURL(qrData);

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

  async validarQRToken(token: string) {
    const qrToken = await this.prisma.qRToken.findFirst({
      where: {
        token,
        usado: false,
        expira_en: { gt: new Date() },
      },
      include: {
        empleado: true,
      },
    });

    if (!qrToken) throw new BadRequestException('Token QR inválido o expirado.');

    await this.prisma.qRToken.update({
      where: { id: qrToken.id },
      data: { usado: true },
    });

    return qrToken;
  }

  async registrarAsistenciaConQR(token: string, tipo: 'entrada' | 'salida') {
    const qrToken = await this.validarQRToken(token);
    return tipo === 'entrada'
      ? this.registrarEntrada(qrToken.empleado_id)
      : this.registrarSalida(qrToken.empleado_id);
  }

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

  async obtenerEmpleadosJefe(jefe_id: number) {
    return this.prisma.empleado.findMany({
      where: { jefe_id },
      include: {
        asistencias: { // Ajusta aquí según el nombre real de la relación en tu schema.prisma
          where: {
            fecha: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
          orderBy: { fecha: 'desc' },
        },
      },
    });
  }
}
