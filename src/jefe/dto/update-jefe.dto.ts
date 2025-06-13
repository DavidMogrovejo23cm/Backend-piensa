import { PartialType } from '@nestjs/mapped-types';
import { CreateJefeDto } from './create-jefe.dto';

export class UpdateJefeDto extends PartialType(CreateJefeDto) {}
