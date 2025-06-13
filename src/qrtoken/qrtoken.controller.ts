import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QrtokenService } from './qrtoken.service';
import { CreateQrtokenDto } from './dto/create-qrtoken.dto';
import { UpdateQrtokenDto } from './dto/update-qrtoken.dto';

@Controller('qrtoken')
export class QrtokenController {
  constructor(private readonly qrtokenService: QrtokenService) {}

  @Post()
  create(@Body() createQrtokenDto: CreateQrtokenDto) {
    return this.qrtokenService.create(createQrtokenDto);
  }

  @Get()
  findAll() {
    return this.qrtokenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qrtokenService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQrtokenDto: UpdateQrtokenDto) {
    return this.qrtokenService.update(+id, updateQrtokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrtokenService.remove(+id);
  }
}
