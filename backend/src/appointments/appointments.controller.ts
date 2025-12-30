import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { AppointmentsService } from './appointments.service';
import { CreateAppointmentPreReserveDto } from './dto/create-appointment-pre-reserve.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { PreReserveAppointmentResponseDto } from './dto/pre-reserve-appointment-response.dto';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('pre-reserve')
  @ApiOperation({ summary: 'Pre-reservar un turno (requiere pago)' })
  @ApiCreatedResponse({ type: PreReserveAppointmentResponseDto })
  async preReserve(
    @Req() req,
    @Body() dto: CreateAppointmentPreReserveDto,
  ): Promise<PreReserveAppointmentResponseDto> {
    return this.appointmentsService.preReserveAppointment(dto, req.user.sub);
  }

  @ApiOperation({ summary: 'Actualizar estado del turno' })
  @ApiOkResponse({ type: AppointmentResponseDto })
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req) {
    return this.appointmentsService.cancelAppointment(id, req.user.sub);
  }
}
