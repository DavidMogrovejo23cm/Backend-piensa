import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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

  @Get('validate')
  validateToken(@Query('token') token: string) {
    return this.qrtokenService.validateToken(token);
  }

  @Get('by-token/:token')
  findByToken(@Param('token') token: string) {
    return this.qrtokenService.findByToken(token);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qrtokenService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQrtokenDto: UpdateQrtokenDto) {
    return this.qrtokenService.update(+id, updateQrtokenDto);
  }

  @Patch(':id/mark-used')
  markAsUsed(@Param('id') id: string) {
    return this.qrtokenService.markAsUsed(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrtokenService.remove(+id);
  }
}