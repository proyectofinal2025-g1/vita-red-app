import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DoctorScheduleResponseDto } from './dto/doctor-schedule-response.dto';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { DoctorScheduleService } from './schedule.service';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { RolesEnum } from '../../user/enums/roles.enum';
import { Roles } from '../../decorators/role.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';

@ApiTags('Doctor Schedule')
@Controller('doctors/schedules')
export class DoctorScheduleController {
  constructor(private readonly doctorScheduleService: DoctorScheduleService) {}

  @ApiOperation({
    summary: 'Crear un schedule.',
  })
  @ApiBearerAuth()
  @Roles(RolesEnum.Medic, RolesEnum.Secretary, RolesEnum.User)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  @ApiCreatedResponse({ type: DoctorScheduleResponseDto })
  create(@Body() dto: CreateDoctorScheduleDto, @Req() req: any) {
    return this.doctorScheduleService.create(dto, req.user.id, req.user.role);
  }

  @ApiOperation({
    summary: 'Ver los schedules de un médico/a.',
  })
  @ApiBearerAuth()
  @Roles(RolesEnum.Medic, RolesEnum.SuperAdmin, RolesEnum.User)
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':doctorId')
  @ApiOkResponse({ type: [DoctorScheduleResponseDto] })
  async findByDoctor(
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return await this.doctorScheduleService.findByDoctor(
      doctorId,
      userId,
      userRole,
    );
  }

  @ApiOperation({
    summary: 'Actualizar el schedule propio del médico/a.',
  })
  @ApiBearerAuth()
  @Roles(RolesEnum.Medic)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('update')
  updateScheduleDoctor(@Req() req: any, @Body() dto: UpdateDoctorScheduleDto) {
    return this.doctorScheduleService.updateScheduleDoctor(
      req.user.id,
      dto,
      req.user.role,
    );
  }
}
