import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationDto } from './dto/Validation.dto';
import { LoginDto } from './dto/Login.dto';
import * as bcrypt from "bcrypt"
import { CreateJefeDto } from 'src/jefe/dto/create-jefe.dto';
import { CreateEmpleadoDto } from 'src/empleado/dto/create-empleado.dto';
import { CreateRegistroAsistenciaDto } from 'src/registro-asistencia/dto/create-registro-asistencia.dto';
import { CreateReporteDto } from 'src/reporte/dto/create-reporte.dto';
import { CreateQrtokenDto } from 'src/qrtoken/dto/create-qrtoken.dto';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, readonly prisma: PrismaService) {}

  // Validación para jefes
  async validateUser(usernameOrEmail: string, contrasena: string): Promise<ValidationDto | undefined> {
    const user = await this.prisma.jefe.findFirst({
      where: {
        OR: [
          { nombre: usernameOrEmail },
          { correo: usernameOrEmail },
        ],
      },
    });

    if (!user) {
      return undefined;
    }

    if (await bcrypt.compare(contrasena, user.contrasena)) {
      const { contrasena, ...result } = user;
      return result;
    }

    return undefined;
  }

  // Validación para empleados (sin contraseña)
  async validateEmpleado(usernameOrEmail: string): Promise<any | undefined> {
    const empleado = await this.prisma.empleado.findFirst({
      where: {
        OR: [
          { nombre: usernameOrEmail },
          { correo: usernameOrEmail },
        ],
        activo: true, // Solo empleados activos
      },
    });

    return empleado || undefined;
  }

  // Login para jefes
  async login(data: LoginDto) {
    const user = await this.prisma.jefe.findFirst({
      where: {
        OR: [
          { nombre: data.usernameOrEmail },
          { correo: data.usernameOrEmail },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const passwordValida = await bcrypt.compare(data.contrasena, user.contrasena);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const payload = {
      id: user.id,
      nombre: user.nombre,
      role: 'jefe',
    };

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

  // Login para empleados (sin contraseña, usando solo identificador)
  async loginEmpleado(usernameOrEmail: string) {
    const empleado = await this.prisma.empleado.findFirst({
      where: {
        OR: [
          { nombre: usernameOrEmail },
          { correo: usernameOrEmail },
        ],
        activo: true,
      },
    });

    if (!empleado) {
      throw new UnauthorizedException('Empleado no encontrado o inactivo.');
    }

    const payload = {
      id: empleado.id,
      nombre: empleado.nombre,
      role: 'empleado',
    };

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

  // Crear jefe
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

  // Autenticar empleado por ID (método alternativo para sistemas internos)
  async autenticarEmpleadoPorId(empleado_id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleado_id, activo: true },
    });

    if (!empleado) {
      throw new UnauthorizedException('Empleado no encontrado o inactivo.');
    }

    const payload = {
      id: empleado.id,
      nombre: empleado.nombre,
      role: 'empleado',
    };

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
    // Convertir string a number si es necesario
    const jefe_id = typeof dto.jefe_id === 'string' ? parseInt(dto.jefe_id) : dto.jefe_id;

    // Verificar que el jefe existe
    const jefe = await this.prisma.jefe.findUnique({
      where: { id: jefe_id },
    });

    if (!jefe) {
      throw new BadRequestException('El jefe especificado no existe.');
    }

    // Verificar que no exista otro empleado con el mismo correo
    const empleadoExistente = await this.prisma.empleado.findFirst({
      where: {
        OR: [
          { correo: dto.correo },
          { nombre: dto.nombre },
        ],
      },
    });

    if (empleadoExistente) {
      throw new BadRequestException('Ya existe un empleado con ese correo o nombre.');
    }

    const empleado = await this.prisma.empleado.create({
      data: {
        nombre: dto.nombre,
        telefono: dto.telefono,
        correo: dto.correo,
        salario_hora: dto.salario_hora,
        activo: dto.activo,
        jefe_id: jefe_id,
      },
    });

    return empleado;
  }

  // Registrar asistencia
  async registrarAsistencia(dto: CreateRegistroAsistenciaDto) {
    // Verificar que el empleado existe y está activo
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: dto.empleado_id },
    });

    if (!empleado || !empleado.activo) {
      throw new BadRequestException('Empleado no encontrado o inactivo.');
    }

    // Verificar si ya existe un registro para el empleado en la fecha especificada
    const fechaInicio = new Date(dto.fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(dto.fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const registroExistente = await this.prisma.registroAsistencia.findFirst({
      where: {
        empleado_id: dto.empleado_id,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });

    let horas_trabajadas = 0;
    if (dto.hora_entrada && dto.hora_salida) {
      const entrada = new Date(dto.hora_entrada);
      const salida = new Date(dto.hora_salida);
      horas_trabajadas = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60);
    }

    const salario_calculado = horas_trabajadas * empleado.salario_hora;

    // Preparar los datos para la actualización
    const updateData: any = {
      horas_trabajadas,
      salario_calculado,
    };

    // Solo incluir las horas si no son null/undefined
    if (dto.hora_entrada !== null && dto.hora_entrada !== undefined) {
      updateData.hora_entrada = dto.hora_entrada;
    }
    if (dto.hora_salida !== null && dto.hora_salida !== undefined) {
      updateData.hora_salida = dto.hora_salida;
    }

    if (registroExistente) {
      // Actualizar registro existente
      return this.prisma.registroAsistencia.update({
        where: { id: registroExistente.id },
        data: updateData,
      });
    } else {
      // Crear nuevo registro
      const createData: any = {
        empleado_id: dto.empleado_id,
        fecha: dto.fecha,
        horas_trabajadas,
        salario_calculado,
      };

      // Solo incluir las horas si no son null/undefined
      if (dto.hora_entrada !== null && dto.hora_entrada !== undefined) {
        createData.hora_entrada = dto.hora_entrada;
      }
      if (dto.hora_salida !== null && dto.hora_salida !== undefined) {
        createData.hora_salida = dto.hora_salida;
      }

      return this.prisma.registroAsistencia.create({
        data: createData,
      });
    }
  }

  // Registrar entrada
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

    if (registroExistente && registroExistente.hora_entrada) {
      throw new BadRequestException('Ya se registró la entrada para hoy.');
    }

    // Verificar que el empleado existe y está activo
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleado_id },
    });

    if (!empleado || !empleado.activo) {
      throw new BadRequestException('Empleado no encontrado o inactivo.');
    }

    if (registroExistente) {
      // Actualizar registro existente con la entrada
      return this.prisma.registroAsistencia.update({
        where: { id: registroExistente.id },
        data: {
          hora_entrada: ahora,
          horas_trabajadas: 0,
          salario_calculado: 0,
        },
      });
    } else {
      // Crear nuevo registro solo con entrada
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
  }

  // Registrar salida
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

    if (!registroExistente || !registroExistente.hora_entrada) {
      throw new BadRequestException('Debe registrar la entrada primero.');
    }

    if (registroExistente.hora_salida) {
      throw new BadRequestException('Ya se registró la salida para hoy.');
    }

    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleado_id },
    });

    if (!empleado) {
      throw new BadRequestException('Empleado no encontrado.');
    }

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

  // Generar reporte
  async generarReporte(dto: CreateReporteDto) {
    // Convertir string a number si es necesario
    const jefe_id = typeof dto.jefe_id === 'string' ? parseInt(dto.jefe_id) : dto.jefe_id;

    const jefe = await this.prisma.jefe.findUnique({
      where: { id: jefe_id },
    });

    if (!jefe) {
      throw new BadRequestException('Jefe no encontrado.');
    }

    // Obtener empleados del jefe
    const empleados = await this.prisma.empleado.findMany({
      where: { jefe_id: jefe_id },
    });

    // Obtener registros de asistencia en el período
    const registros = await this.prisma.registroAsistencia.findMany({
      where: {
        empleado_id: { in: empleados.map(e => e.id) },
        fecha: {
          gte: dto.periodo_inicio,
          lte: dto.periodo_fin,
        },
      },
      include: {
        empleado: true,
      },
    });

    // Crear el reporte
    const reporte = await this.prisma.reporte.create({
      data: {
        jefe_id: jefe_id,
        fecha_generacion: dto.fecha_generacion,
        periodo_inicio: dto.periodo_inicio,
        periodo_fin: dto.periodo_fin,
      },
    });

    // Calcular estadísticas
    const estadisticas = {
      total_empleados: empleados.length,
      total_registros: registros.length,
      total_horas_trabajadas: registros.reduce((sum, r) => sum + r.horas_trabajadas, 0),
      total_salarios: registros.reduce((sum, r) => sum + r.salario_calculado, 0),
      empleados_activos: empleados.filter(e => e.activo).length,
    };

    return {
      reporte,
      estadisticas,
      registros,
    };
  }

  // Generar token QR
  async generarQRToken(empleado_id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: empleado_id },
    });

    if (!empleado || !empleado.activo) {
      throw new BadRequestException('Empleado no encontrado o inactivo.');
    }

    // Invalidar tokens anteriores no usados
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
    const expira_en = new Date(ahora.getTime() + 5 * 60 * 1000); // 5 minutos

    // Generar QR code
    const qrData = JSON.stringify({
      token,
      empleado_id,
      timestamp: ahora.toISOString(),
    });

    const qrCode = await QRCode.toDataURL(qrData);

    const qrToken = await this.prisma.qRToken.create({
      data: {
        token,
        empleado_id,
        creado_en: ahora,
        expira_en,
        usado: false,
        qrCode,
      },
    });

    return qrToken;
  }

  // Validar y usar token QR
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

    if (!qrToken) {
      throw new BadRequestException('Token QR inválido o expirado.');
    }

    // Marcar token como usado
    await this.prisma.qRToken.update({
      where: { id: qrToken.id },
      data: { usado: true },
    });

    return qrToken;
  }

  // Registrar asistencia con QR
  async registrarAsistenciaConQR(token: string, tipo: 'entrada' | 'salida') {
    const qrToken = await this.validarQRToken(token);
    
    if (tipo === 'entrada') {
      return this.registrarEntrada(qrToken.empleado_id);
    } else {
      return this.registrarSalida(qrToken.empleado_id);
    }
  }

  // Obtener historial de asistencia
  async obtenerHistorialAsistencia(empleado_id: number, fecha_inicio?: Date, fecha_fin?: Date) {
    const whereClause: any = { empleado_id };
    
    if (fecha_inicio || fecha_fin) {
      whereClause.fecha = {};
      if (fecha_inicio) whereClause.fecha.gte = fecha_inicio;
      if (fecha_fin) whereClause.fecha.lte = fecha_fin;
    }

    return this.prisma.registroAsistencia.findMany({
      where: whereClause,
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

  // Obtener empleados de un jefe
  async obtenerEmpleadosJefe(jefe_id: number) {
    return this.prisma.empleado.findMany({
      where: { jefe_id },
      include: {
        asistencias: { // Cambiado de 'registroAsistencia' a 'asistencias'
          where: {
            fecha: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Últimos 30 días
            },
          },
          orderBy: { fecha: 'desc' },
        },
      },
    });
  }
}