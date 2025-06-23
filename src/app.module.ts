import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtStrategy } from './auth/strategies/jwt.strategie';

import { AppController } from './app.controller'; // 👈 importa
import { AppService } from './app.service';       // 👈 importa

@Module({
  controllers: [AuthController, AppController], // 👈 agrega AppController
  providers: [AuthService, PrismaService, JwtStrategy, AppService], // 👈 agrega AppService
  exports: [AuthService],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'tu_clave_secreta',
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AppModule {}