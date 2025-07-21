import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/Login.dto';
import { CreateJefeDto } from 'src/jefe/dto/create-jefe.dto';
import { CreateEmpleadoDto } from 'src/empleado/dto/create-empleado.dto';
import { CreateRegistroAsistenciaDto } from 'src/registro-asistencia/dto/create-registro-asistencia.dto';

// DTO específico para el frontend
class LoginJefeDto {
  usernameOrEmail: string;
  contrasena: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================== AUTENTICACIÓN ====================

  @Post('login-jefe')
  @HttpCode(HttpStatus.OK)
  async loginJefe(@Body() body: LoginJefeDto) {
    try {
      console.log('Datos recibidos en login-jefe:', body);

      const loginData: LoginDto = {
        usernameOrEmail: body.usernameOrEmail,
        contrasena: body.contrasena,
      };

      const result = await this.authService.login(loginData);

      return {
        success: true,
        message: 'Login exitoso',
        jefe: result.user,
        token: result.access_token,
        refresh_token: result.refresh_token,
      };
    } catch (error) {
      console.error('Error en login-jefe:', error);
      throw error;
    }
  }

  @Post('login-empleado')
  @HttpCode(HttpStatus.OK)
  async loginEmpleado(@Body() body: { usernameOrEmail: string }) {
    return this.authService.loginEmpleado(body.usernameOrEmail);
  }

  @Post('login-empleado-id/:id')
  @HttpCode(HttpStatus.OK)
  async loginEmpleadoById(@Param('id') id: string) {
    return this.authService.autenticarEmpleadoPorId(parseInt(id));
  }

  // ==================== REGISTRO DE USUARIOS ====================

  @Post('crear-jefe')
  async crearJefe(@Body() createJefeDto: CreateJefeDto) {
    console.log('Datos recibidos para crear jefe:', createJefeDto);
    return this.authService.create(createJefeDto);
  }

  @Post('crear-empleado')
  async crearEmpleado(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    console.log('Datos recibidos para crear empleado:', createEmpleadoDto);
    return this.authService.createEmpleado(createEmpleadoDto);
  }

  // ==================== REGISTRO DE ASISTENCIA ====================

  @Post('registrar-asistencia')
  async registrarAsistencia(@Body() dto: CreateRegistroAsistenciaDto) {
    return this.authService.registrarAsistencia(dto);
  }

  @Post('registrar-entrada/:empleado_id')
  async registrarEntrada(@Param('empleado_id') empleado_id: string) {
    return this.authService.registrarEntrada(parseInt(empleado_id));
  }

  @Post('registrar-salida/:empleado_id')
  async registrarSalida(@Param('empleado_id') empleado_id: string) {
    return this.authService.registrarSalida(parseInt(empleado_id));
  }

  @Post('registrar-asistencia-qr')
  async registrarAsistenciaQR(@Body() body: { token: string; tipo: 'entrada' | 'salida' }) {
    return this.authService.registrarAsistenciaConQR(body.token, body.tipo);
  }

  // ==================== TOKENS QR ====================

  @Post('generar-qr/:empleado_id')
  async generarQR(@Param('empleado_id') empleado_id: string) {
    return this.authService.generarQRToken(parseInt(empleado_id));
  }

  @Post('validar-qr')
  async validarQR(@Body() body: { token: string }) {
    return this.authService.validarQRToken(body.token);
  }

  // ==================== CONSULTAS ====================

  @Get('historial-asistencia/:empleado_id')
  async obtenerHistorial(
    @Param('empleado_id') empleado_id: string,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string
  ) {
    const fechaInicio = fecha_inicio ? new Date(fecha_inicio) : undefined;
    const fechaFin = fecha_fin ? new Date(fecha_fin) : undefined;

    return this.authService.obtenerHistorialAsistencia(
      parseInt(empleado_id),
      fechaInicio,
      fechaFin
    );
  }

  @Get('empleados-jefe/:jefe_id')
  async obtenerEmpleadosJefe(@Param('jefe_id') jefe_id: string) {
    return this.authService.obtenerEmpleadosJefe(parseInt(jefe_id));
  }

  // ==================== ENDPOINTS DE VALIDACIÓN ====================

  @Post('validate-user')
  async validateUser(@Body() body: { usernameOrEmail: string; contrasena: string }) {
    return this.authService.validateUser(body.usernameOrEmail, body.contrasena);
  }

  @Post('validate-empleado')
  async validateEmpleado(@Body() body: { usernameOrEmail: string }) {
    return this.authService.validateEmpleado(body.usernameOrEmail);
  }
}
