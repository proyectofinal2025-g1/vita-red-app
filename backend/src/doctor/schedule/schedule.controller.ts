import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DoctorScheduleResponseDto } from './dto/doctor-schedule-response.dto';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { DoctorScheduleService } from './schedule.service';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { RolesEnum } from '../../user/enums/roles.enum';
import { Roles } from '../../decorators/role.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { mapDayToNumber } from './helper/mapDayOfWeek.helper';

@ApiTags('Doctor Schedule')
@Controller('doctors/schedules')
export class DoctorScheduleController {
  constructor(private readonly doctorScheduleService: DoctorScheduleService) {}

  @ApiBearerAuth()
  @Roles(RolesEnum.Medic, RolesEnum.Secretary)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  @ApiCreatedResponse({ type: DoctorScheduleResponseDto })
  create(@Body() dto: CreateDoctorScheduleDto) {
    return this.doctorScheduleService.create(
      {
        dayOfWeek: mapDayToNumber(dto.dayOfWeek),
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotDuration: dto.slotDuration,
      },
      dto.doctorId,
    );
  }

  @ApiBearerAuth()
  @Roles(RolesEnum.Medic, RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':doctorId')
  @ApiOkResponse({ type: [DoctorScheduleResponseDto] })
  async findByDoctor(@Param('doctorId', ParseUUIDPipe) doctorId: string) {
    return await this.doctorScheduleService.findByDoctor(doctorId);
  }


  @ApiBearerAuth()
  @Roles(RolesEnum.Medic)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('update/:doctorId')
  updateDoctor(@Req() req: any ,@Body() dto: UpdateDoctorScheduleDto) {
    const doctorId = req.user.id
    console.log(req.user)
    return this.doctorScheduleService.updateScheduleDoctor(doctorId, dto);
  }
}
