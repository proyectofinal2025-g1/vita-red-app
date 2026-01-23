import { Controller, Get, Post, Body, Query, ParseUUIDPipe, Param, UseGuards } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { RolesEnum } from '../user/enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('medical-record')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) { }

  @ApiOperation({
    summary: 'Crear un regístro médico post consulta',
  })
  @Roles(RolesEnum.Medic)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async createMedicalRecord(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    const newMedicalRecords = await this.medicalRecordService.createMedicalRecord(createMedicalRecordDto);
    return {
      message: 'Medical consultation request successfully completed',
      medical_record: newMedicalRecords
    }
  }

  @ApiOperation({
    summary: 'Buscar el historial clínico de un paciente',
  })
  @ApiQuery({
    name: 'patient_id',
    required: true
  })
  @Roles(RolesEnum.Medic, RolesEnum.User, RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('patient/medical-history')
  async findMedicalHistory(@Query('patient_id', ParseUUIDPipe) patientId: string) {
    return await this.medicalRecordService.findMedicalHistory(patientId);
  }

  @ApiOperation({
    summary: 'Buscar los registros de un doctor',
  })
  @ApiQuery({
    name: 'doctor_id',
    required: true
  })
  @Roles(RolesEnum.Medic, RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('doctor/medical-records')
  async findMedicalRecords(@Query('doctor_id', ParseUUIDPipe) doctorId: string) {
    return await this.medicalRecordService.findMedicalRecords(doctorId);
  }

  @ApiOperation({
    summary: 'Buscar un registro médico por ID',
  })
  @Roles(RolesEnum.Medic, RolesEnum.User, RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.medicalRecordService.findById(id);
  }
}
