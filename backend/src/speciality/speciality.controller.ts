import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { CreateEspecialityDto } from './dto/create-speciality.dto';
import { UpdateEspecialityDto } from './dto/update-speciality.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SpecialityResponseDto } from './dto/speciality-response.dto';

@ApiTags('Speciality')
@Controller('speciality')
export class SpecialityController {
  constructor(
    private readonly specialityService: SpecialityService
  ) {}

  @ApiCreatedResponse({ type: SpecialityResponseDto })
  @Post()
  async create(@Body() specialityDto: CreateEspecialityDto) {
    return await this.specialityService.create(specialityDto);
  }

  @ApiOkResponse({ type: [SpecialityResponseDto] })
  @Get()
  async findAll() {
    return await this.specialityService.findAll();
  }

  @ApiOkResponse({ type: SpecialityResponseDto })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe ) id: string) {
    return await this.specialityService.findOne(id);
  }

  @ApiOkResponse({ type: SpecialityResponseDto })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSpecialityDto: UpdateEspecialityDto) {
    return await this.specialityService.update(id,updateSpecialityDto );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.specialityService.remove(id);
  }
}
