import { PartialType } from '@nestjs/mapped-types';
import { CreateQrtokenDto } from './create-qrtoken.dto';

export class UpdateQrtokenDto extends PartialType(CreateQrtokenDto) {}
