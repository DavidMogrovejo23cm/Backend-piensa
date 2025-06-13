import { Injectable } from '@nestjs/common';
import { CreateRegistroAsistenciaDto } from './dto/create-registro-asistencia.dto';
import { UpdateRegistroAsistenciaDto } from './dto/update-registro-asistencia.dto';

@Injectable()
export class RegistroAsistenciaService {
  create(createRegistroAsistenciaDto: CreateRegistroAsistenciaDto) {
    return 'This action adds a new registroAsistencia';
  }

  findAll() {
    return `This action returns all registroAsistencia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} registroAsistencia`;
  }

  update(id: number, updateRegistroAsistenciaDto: UpdateRegistroAsistenciaDto) {
    return `This action updates a #${id} registroAsistencia`;
  }

  remove(id: number) {
    return `This action removes a #${id} registroAsistencia`;
  }
}
