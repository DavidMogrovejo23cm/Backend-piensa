import { Injectable } from '@nestjs/common';
import { CreateQrtokenDto } from './dto/create-qrtoken.dto';
import { UpdateQrtokenDto } from './dto/update-qrtoken.dto';

@Injectable()
export class QrtokenService {
  create(createQrtokenDto: CreateQrtokenDto) {
    return 'This action adds a new qrtoken';
  }

  findAll() {
    return `This action returns all qrtoken`;
  }

  findOne(id: number) {
    return `This action returns a #${id} qrtoken`;
  }

  update(id: number, updateQrtokenDto: UpdateQrtokenDto) {
    return `This action updates a #${id} qrtoken`;
  }

  remove(id: number) {
    return `This action removes a #${id} qrtoken`;
  }
}
