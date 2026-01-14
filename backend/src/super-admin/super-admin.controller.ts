import { Controller, Get, Post, Body, Patch, Param, Query, ParseBoolPipe, ParseEnumPipe, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RolesEnum } from '../user/enums/roles.enum';
import { Roles } from '../decorators/role.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SuperAdminResponse } from './dto/super-admin.response.dto';
import { SpecialityEnum } from './enum/speciality.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AdminOverviewResponseDto } from './dto/AdminOverviewResponse.dto';
import { SecretaryService } from '../secretary/secretary.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { CreateDoctorDto } from '../doctor/dto/create-doctor.dto';
import { CreateDoctorScheduleDto } from '../doctor/schedule/dto/create-doctor-schedule.dto';
import { UpdateDoctorScheduleDtoBySecretary } from '../secretary/dto/scheduleDoctor.dto';
import { CreateAppointmentPreReserveDto } from '../appointments/dto/create-appointment-pre-reserve.dto';

@ApiBearerAuth()
@Controller('superadmin')
export class SuperAdminController {
  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly secretaryService: SecretaryService
  ) { }

  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description:
      'Devuelve una lista de todos los usuarios registrados en el sistema. ' +
      'Endpoint exclusivo para SUPER_ADMIN.',
  })
  @ApiQuery({
    name: 'role',
    enum: RolesEnum,
    required: false,
    description: 'Filtrar usuarios por rol'
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    type: Boolean,
    description: 'Filtrar usuarios por estado de actividad'
  })
  @Get('users')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async findAll(@Query('role', new ParseEnumPipe(RolesEnum)) role?: RolesEnum, @Query('is_active', ParseBoolPipe) is_active?: boolean) {
    const users = await this.superAdminService.findAll(role, is_active);
    return users.map(user => new SuperAdminResponse(user));
  }

  @ApiOperation({
    summary: 'Obtener todos los doctores',
    description:
      'Devuelve una lista de todos los doctores registrados en el sistema. ' +
      'Endpoint exclusivo para SUPER_ADMIN.',
  })
  @ApiQuery({
    name: 'speciality',
    enum: SpecialityEnum,
    required: false,
    description: 'Filtrar doctores por especialidad'
  })
  @Get('doctors')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async findAllDoctors(@Query('speciality') speciality?: SpecialityEnum) {
    return await this.superAdminService.findAllDoctors(speciality);
  }


  @ApiOperation({
    summary: 'Obtener estadísticas generales del sistema',
    description:
      'Devuelve estadísticas básicas del sistema: usuarios, doctores, secretarias y turnos (si aplica). ' +
      'Endpoint exclusivo para SUPER_ADMIN.',
  })
  @ApiOkResponse({
    description: 'Estadísticas generales del sistema',
    type: AdminOverviewResponseDto,
  })
  @Get('overview')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async getOverview() {
    return await this.superAdminService.getOverview();
  }

  @ApiOperation({
    summary: 'Actualizar el estado activo/inactivo de un usuario',
    description:
      'Permite activar o desactivar un usuario específico. ' +
      'Endpoint exclusivo para SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'UUID del usuario para actualizar el estado'
  })
  @Patch('users/:id/status')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async updateActive(@Param('id', ParseUUIDPipe) id: string) {
    return await this.superAdminService.updateActive(id);
  }

  @ApiOperation({
    summary: 'Actualizar el rol de un usuario',
    description:
      'Permite actualizar el rol de un usuario específico. ' +
      'Endpoint exclusivo para SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'UUID del usuario'
  })
  @Patch('users/:id/role')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async updateRole(@Param('id', ParseUUIDPipe) id: string, @Body() role: UpdateUserRoleDto) {
    return await this.superAdminService.updateRole(id, role.role);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener paciente por ID',
    description:
      'Devuelve los datos de un paciente buscado por su ID. Endpoint exclusivo para SUPER_ADMIN.'
  })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('patients/:id')
  async findOnePatient(@Param('id', ParseUUIDPipe) id: string) {
    return await this.secretaryService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar un paciente por DNI',
    description:
      'Filtrar la búsqueda de pacientes por dni'
  })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('patients/dni/:dni')
  async getPatientByDni(@Param('dni') dni: string) {
    return await this.secretaryService.getPatientByDni(dni)
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crea un paciente nuevo',
    description:
      'Crea y guarda en la base de datos un paciente nuevo'
  })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('patients')
  async createPatient(@Body() registerDto: CreateUserDto) {
    return await this.secretaryService.createPatient(registerDto)
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar paciente',
    description:
      'Actualiza el perfil de un paciente por su ID'
  })
  @Roles(RolesEnum.SuperAdmin,)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('patients/:id')
  async updatePatient(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.secretaryService.updatePatient(id, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crea un perfil médico nuevo',
    description:
      'Crea y guarda en la base de datos un doctor nuevo'
  })
  @Roles(RolesEnum.SuperAdmin,)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('doctors')
  async createDoctor(@Body() createDoctor: CreateDoctorDto) {
    return await this.secretaryService.createDoctor(createDoctor)
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar un médico/a por id.'
  })
  @ApiParam({
    name: 'doctorId',
    type: 'string',
    required: true
  })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('doctors/:doctorId')
  async getDoctorById(@Param('doctorId') doctorId: string) {
    return await this.secretaryService.getDoctorById(doctorId)
  }

  @ApiBearerAuth()
  @ApiParam({
    name: 'doctorId',
    type: 'string',
    required: true,
  })
  @ApiOperation({
    summary: 'Crea un schedule para un médico.',
  })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('doctors/:doctorId/schedules')
  async createScheduleDoctor(
    @Body() dto: CreateDoctorScheduleDto,
    @Param('doctorId') doctorId: string,
    @Request() req: any,
  ) {
    return this.secretaryService.createScheduleDoctor(
      {
        ...dto,
        doctorId,
      },
      req.user.id,
      req.user.role,
    );
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Modifica el schedule de un médico/a.',
  })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('doctors/:doctorId/schedules')
  updateDoctorSchedule(
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
    @Body() dto: UpdateDoctorScheduleDtoBySecretary,
  ) {
    return this.secretaryService.updateScheduleDoctor(doctorId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ver schedules de un médico/a.',
  })
  @ApiParam({
    name: 'doctorId',
    type: 'string',
    required: true,
  })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('doctors/:doctorId/schedules')
  async findDoctorSchedules(
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
    @Request() req: any,
  ) {
    return this.secretaryService.findSchedulesByDoctor(
      doctorId,
      req.user.id,
      req.user.role,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ver el historial de los turno del paciente.'
  })
  @ApiParam({
    name: 'patientId',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'date',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'speciality',
    type: 'string',
    required: false,
  })
  @Roles(RolesEnum.SuperAdmin,)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('appointments/:patientId/list')
  async findAppointmentsByPatientId(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('date') date?: string,
    @Query('speciality') speciality?: string
  ) {
    return await this.secretaryService.findAppointmentsByPatientId(patientId, date, speciality)
  }

  @ApiBearerAuth()
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Pre-reservar un turno para los pacientes'
  })
  @Post('appointments/pre-reserve/:userId')
  async preReserveAppointment(
    @Body() dto: CreateAppointmentPreReserveDto,
    @Param('userId') userId: string
  ) {
    return await this.secretaryService.preReserveAppointment(dto, userId)
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ver agenda del médico/a.'
  })
  @ApiParam({
    name: 'doctorId',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'date',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'patientId',
    type: 'string',
    required: false,
  })
  @Roles(RolesEnum.SuperAdmin,)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('appointments/doctors/:doctorId')
  async findAgendByDoctor(
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
    @Query('date') date?: string,
    @Query('patientId', ParseUUIDPipe) patientId?: string
  ) {
    return await this.secretaryService.findAgendByDoctor(doctorId, date, patientId)
  }

}
