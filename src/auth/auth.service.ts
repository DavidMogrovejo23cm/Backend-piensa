import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationDto } from './dto/Validation.dto';
import { LoginDto } from './dto/Login.dto';
import * as bcrypt from "bcrypt"
import { CreateJefeDto } from 'src/jefe/dto/create-jefe.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, readonly prisma: PrismaService) {}

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
      nombre: user.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
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
}