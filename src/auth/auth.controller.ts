import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateJefeDto } from 'src/jefe/dto/create-jefe.dto';
import { LoginDto } from './dto/Login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() CreateJefeDto: CreateJefeDto) {
    return this.authService.create(CreateJefeDto);
  }
  @Post('login')
  login(@Body() LoginDto: LoginDto){
    return this.authService.login(LoginDto)
  }
}
