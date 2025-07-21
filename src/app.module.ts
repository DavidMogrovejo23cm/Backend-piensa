import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtStrategy } from './auth/strategies/jwt.strategie';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QrtokenModule } from './qrtoken/qrtoken.module';
import { JefeModule } from './jefe/jefe.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { RegistroAsistenciaModule } from './registro-asistencia/registro-asistencia.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'tu_clave_secreta_cambiar_en_produccion',
      signOptions: { expiresIn: '1h' },
    }),
    QrtokenModule,
    JefeModule,
    EmpleadoModule,
    RegistroAsistenciaModule,
  ],
  controllers: [AuthController, AppController],
  providers: [AuthService, PrismaService, JwtStrategy, AppService],
  exports: [AuthService, PrismaService], 
})
export class AppModule {}