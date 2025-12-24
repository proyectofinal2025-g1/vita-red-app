import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DoctorScheduleResponseDto } from './dto/doctor-schedule-response.dto';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { DoctorScheduleService } from './schedule.service';

@ApiTags('Doctor Schedule')
@Controller('doctors/schedules')
export class DoctorScheduleController {
  constructor(private readonly doctorScheduleService: DoctorScheduleService) {}

  @Post()
  @ApiCreatedResponse({ type: DoctorScheduleResponseDto })
  create(@Body() dto: CreateDoctorScheduleDto) {
    return this.doctorScheduleService.create(
      {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotDuration: dto.slotDuration,
      },
      dto.doctorId,
    );
  }

  @Get(':doctorId')
  @ApiOkResponse({ type: [DoctorScheduleResponseDto] })
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.doctorScheduleService.findByDoctor(doctorId);
  }
}
