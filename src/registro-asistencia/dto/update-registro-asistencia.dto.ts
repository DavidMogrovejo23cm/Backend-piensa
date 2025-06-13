import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistroAsistenciaDto } from './create-registro-asistencia.dto';

export class UpdateRegistroAsistenciaDto extends PartialType(CreateRegistroAsistenciaDto) {}
