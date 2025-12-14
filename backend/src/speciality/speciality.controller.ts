import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { CreateEspecialityDto } from './dto/create-speciality.dto';
import { UpdateEspecialityDto } from './dto/update-speciality.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SpecialityResponseDto } from './dto/speciality-response.dto';
import { Roles } from '../decorators/role.decorator';
import { RolesEnum } from '../user/enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiBearerAuth()
@ApiTags('Speciality')
@Controller('speciality')
export class SpecialityController {
  constructor(
    private readonly specialityService: SpecialityService
  ) {}

  @ApiCreatedResponse({ type: SpecialityResponseDto })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async create(@Body() specialityDto: CreateEspecialityDto) {
    return await this.specialityService.create(specialityDto);
  }

  @ApiOkResponse({ type: [SpecialityResponseDto] })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return await this.specialityService.findAll();
  }

  @ApiOkResponse({ type: SpecialityResponseDto })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe ) id: string) {
    return await this.specialityService.findOne(id);
  }

  @ApiOkResponse({ type: SpecialityResponseDto })
  @Patch(':id')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() updateSpecialityDto: UpdateEspecialityDto) {
    return await this.specialityService.update(id,updateSpecialityDto );
  }

  @Delete(':id')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    return await this.specialityService.remove(id);
  }
}
