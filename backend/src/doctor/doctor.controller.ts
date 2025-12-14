import {Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, Req,} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags,} from '@nestjs/swagger';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { Roles } from '../decorators/role.decorator';
import { RolesEnum } from '../user/enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiBearerAuth()
@ApiTags('Doctor - Endpoints')
@UseGuards(AuthGuard, RolesGuard)
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
  @ApiCreatedResponse({ type: DoctorResponseDto })
  @Post()
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create({
      licence_number: createDoctorDto.licence_number,
      user_id: createDoctorDto.user_id,
      speciality_id: createDoctorDto.speciality_id,
    });
  }

  @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
  @ApiOkResponse({ type: [DoctorResponseDto] })
  @Get()
  async findAll() {
    return this.doctorService.findAll();
  }

  @Roles(RolesEnum.Medic)
  @ApiOkResponse({ type: DoctorResponseDto })
  @Get('me')
  async meDoctor(@Req() req: any) {
    return this.doctorService.findMeDoctor(req.user);
  }

  @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
  @ApiOkResponse({ type: DoctorResponseDto })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.findOne(id);
  }

  @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
  @ApiOkResponse({ type: DoctorResponseDto })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.update(id, {
      licence_number: updateDoctorDto.licence_number,
      speciality_id: updateDoctorDto.speciality_id,
    });
  }

  @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.remove(id);
  }
}
