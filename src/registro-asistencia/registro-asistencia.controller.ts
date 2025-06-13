import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegistroAsistenciaService } from './registro-asistencia.service';
import { CreateRegistroAsistenciaDto } from './dto/create-registro-asistencia.dto';
import { UpdateRegistroAsistenciaDto } from './dto/update-registro-asistencia.dto';

@Controller('registro-asistencia')
export class RegistroAsistenciaController {
  constructor(private readonly registroAsistenciaService: RegistroAsistenciaService) {}

  @Post()
  create(@Body() createRegistroAsistenciaDto: CreateRegistroAsistenciaDto) {
    return this.registroAsistenciaService.create(createRegistroAsistenciaDto);
  }

  @Get()
  findAll() {
    return this.registroAsistenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registroAsistenciaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegistroAsistenciaDto: UpdateRegistroAsistenciaDto) {
    return this.registroAsistenciaService.update(+id, updateRegistroAsistenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registroAsistenciaService.remove(+id);
  }
}
