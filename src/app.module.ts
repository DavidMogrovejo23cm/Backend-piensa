import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtStrategy } from './auth/strategies/jwt.strategie';
import { PassportModule } from '@nestjs/passport';


@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: "tu_clave_secreta",
      signOptions: { expiresIn: "1h"},
    }),
  ],
})
export class AppModule {}
