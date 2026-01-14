import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { SpecialityService } from './speciality.service';
import { CreateEspecialityDto } from './dto/create-speciality.dto';
import { UpdateEspecialityDto } from './dto/update-speciality.dto';
import { SpecialityResponseDto } from './dto/speciality-response.dto';

import { Roles } from '../decorators/role.decorator';
import { RolesEnum } from '../user/enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Specialities')
@Controller('speciality')
export class SpecialityController {
  constructor(private readonly specialityService: SpecialityService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva especialidad' })
  @ApiCreatedResponse({ type: SpecialityResponseDto })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async create(@Body() dto: CreateEspecialityDto) {
    return this.specialityService.create(dto);
  }

  @ApiOperation({ summary: 'Obtener todas las especialidades activas' })
  @ApiOkResponse({ type: [SpecialityResponseDto] })
  @Get()
  async findAll() {
    return this.specialityService.findAll();
  }

  @ApiOperation({ summary: 'Obtener una especialidad por ID' })
  @ApiOkResponse({ type: SpecialityResponseDto })
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.specialityService.findById(id);
  }

  @ApiOperation({
    summary: 'Obtener médicos/as buscando por especialidad',
  })
  @ApiOkResponse({ type: SpecialityResponseDto })
  @Get('by-name/:name')
  async findByName(@Param('name') name: string) {
    return this.specialityService.findByNameWithDoctors(name);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una especialidad' })
  @ApiOkResponse({ type: SpecialityResponseDto })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEspecialityDto,
  ) {
    return this.specialityService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una especialidad (soft delete)' })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.specialityService.remove(id);
  }
}
