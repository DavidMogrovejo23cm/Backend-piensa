import { PartialType } from '@nestjs/mapped-types';
import { CreateJefeDto } from './create-jefe.dto';

export class UpdateJefeDto extends PartialType(CreateJefeDto) {
    nombre?: string;
  correo?: string;
  contrasena?: string;
  jefeRolId?: number;
}
