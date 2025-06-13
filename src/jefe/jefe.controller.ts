import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JefeService } from './jefe.service';
import { CreateJefeDto } from './dto/create-jefe.dto';
import { UpdateJefeDto } from './dto/update-jefe.dto';

@Controller('jefe')
export class JefeController {
  constructor(private readonly jefeService: JefeService) {}

  @Post()
  create(@Body() createJefeDto: CreateJefeDto) {
    return this.jefeService.create(createJefeDto);
  }

  @Get()
  findAll() {
    return this.jefeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jefeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJefeDto: UpdateJefeDto) {
    return this.jefeService.update(+id, updateJefeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jefeService.remove(+id);
  }
}
