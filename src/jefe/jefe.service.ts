import { Injectable } from '@nestjs/common';
import { CreateJefeDto } from './dto/create-jefe.dto';
import { UpdateJefeDto } from './dto/update-jefe.dto';

@Injectable()
export class JefeService {
  create(createJefeDto: CreateJefeDto) {
    return 'This action adds a new jefe';
  }

  findAll() {
    return `This action returns all jefe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jefe`;
  }

  update(id: number, updateJefeDto: UpdateJefeDto) {
    return `This action updates a #${id} jefe`;
  }

  remove(id: number) {
    return `This action removes a #${id} jefe`;
  }
}
