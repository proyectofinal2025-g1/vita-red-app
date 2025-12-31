import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { RolesEnum } from "../user/enums/roles.enum";
import { SecretaryService } from "./secretary.service";
import { User } from "../user/entities/user.entity";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { CreateDoctorDto } from "../doctor/dto/create-doctor.dto";
import { Roles } from "../decorators/role.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateAppointmentPreReserveDto } from "../appointments/dto/create-appointment-pre-reserve.dto";
import { UpdateDoctorScheduleDto } from "../doctor/schedule/dto/update-doctor-schedule.dto";
import { UpdateDoctorScheduleDtoBySecretary } from "./dto/scheduleDoctor.dto";
import { CreateDoctorScheduleDto } from "../doctor/schedule/dto/create-doctor-schedule.dto";

@Controller('secretary')
export class SecretaryController {
    constructor(private readonly secretaryService: SecretaryService) { }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Obtener todos los usuarios',
        description:
            'Devuelve una lista de todos los usuarios registrados en el sistema, opcionalmente pudiendo filtrando por rol y/o por estado activo. '
    })
    @ApiQuery({
        name: 'role',
        required: false,
        enum: RolesEnum,
    })
    @ApiQuery({
        name: 'is_active',
        required: false,
        type: Boolean,
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary, RolesEnum.Medic)
    @UseGuards(AuthGuard, RolesGuard)
    @Get()
    async findAll(
        @Query('role', new ParseEnumPipe(RolesEnum, { optional: true })) role?: RolesEnum,
        @Query('is_active', new ParseBoolPipe({ optional: true })) is_active?: boolean,
    ) {
        return this.secretaryService.findAll({ role, is_active });
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Obtener usuario por ID',
        description:
            'Devuelve el usuario buscado por su ID'
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary, RolesEnum.Medic)
    @UseGuards(AuthGuard, RolesGuard)
    @Get(':id/')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return await this.secretaryService.findOne(id);
    }


    /* PATIENT */

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Buscar un paciente por nombre',
        description:
            'Filtrar la búsqueda de pacientes por nombre'
    })

    @ApiQuery({
        type: 'string',
        required: false,
    })
    @ApiQuery({
        name: 'last_name',
        type: 'string',
        required: false,
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary, RolesEnum.Medic)
    @UseGuards(AuthGuard, RolesGuard)
    @Get('patient/name/')
    async getPatientByName(
        @Query('first_name') first_name?: string,
        @Query('last_name') last_name?: string,
    ) {
        return await this.secretaryService.getPatientByName(first_name, last_name)
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Buscar un paciente por DNI',
        description:
            'Filtrar la búsqueda de pacientes por dni'
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary, RolesEnum.Medic)
    @UseGuards(AuthGuard, RolesGuard)
    @Get('patient/dni/:dni')
    async getPatientByDni(@Param('dni') dni: string) {
        return await this.secretaryService.getPatientByDni(dni)
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Crea un usuario nuevo',
        description:
            'Crea y guarda en la base de datos un usuario nuevo'
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Post('patient')
    async createPatient(@Body() registerDto: CreateUserDto) {
        return await this.secretaryService.createPatient(registerDto)
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Actualiza un usuario',
        description:
            'Actualiza el perfil de un usuario por su ID'
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Patch('patient/:id')
    async updatePatient(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: User) {
        return await this.secretaryService.updatePatient(id, updateUserDto);
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Elimina un usuario',
        description:
            'Cambia el estado de un usuario(solamente paciente) a "inactivo"'
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Delete('patient/:id')
    async disablePatient(@Param('id', ParseUUIDPipe) id: string) {
        return await this.secretaryService.disablePatient(id);
    }



    /*   DOCTOR    */

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Crea un perfil médico nuevo',
        description:
            'Crea y guarda en la base de datos un doctor nuevo'
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Post('Doctor')
    async createDoctor(@Body() createDoctor: CreateDoctorDto) {
        return await this.secretaryService.createDoctor(createDoctor)
    }
    

    @ApiOperation({
        summary: 'Obtener todos los médicos',
        description:
            'Devuelve una lista de todos los médicos registrados en el sistema, opcionalmente pudiendo filtrando por nombre. '
    })
    @ApiQuery({
        name: 'doctorName',
        type: 'string',
        required: false,
    })
    @Get('Doctor/:name')
    async getDoctors(
        @Query('doctorName') name?: string
    ) {
        return await this.secretaryService.getDoctors(name)
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
    @Roles(RolesEnum.Secretary, RolesEnum.SuperAdmin)
    @UseGuards(AuthGuard, RolesGuard)
    @Get('doctor/:doctorId')
    async getDoctorById(@Param('doctorId') doctorId: string){
        return await this.secretaryService.getDoctorById(doctorId)
    }



    @ApiBearerAuth()
    @ApiParam({
        name: 'doctorId',
        type: 'string',
        required: true
    })
    @ApiOperation({
        summary: 'Crea un schedule para un médico.'
    })
    @Roles(RolesEnum.Secretary, RolesEnum.SuperAdmin)
    @UseGuards(AuthGuard, RolesGuard)
    @Post('doctor/createSchedule/:doctorId')
    async createScheduleDoctor(
        @Body() dto: CreateDoctorScheduleDto,
        @Param('doctorId') doctorId: string
    ){
        return await this.secretaryService.createScheduleDoctor(dto, doctorId)
    }
    


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Modifica schedule de un médico/a.',
    })
    @Roles(RolesEnum.Secretary, RolesEnum.SuperAdmin)
    @UseGuards(AuthGuard, RolesGuard)
    @Patch('doctor/updateSchedule/:doctorId')
    async updateDoctorSchedule(
        @Param('doctorId', ParseUUIDPipe) doctorId: string,
        @Body() dto: UpdateDoctorScheduleDtoBySecretary) {
      return await this.secretaryService.updateScheduleDoctor(doctorId, dto)
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Obtener médicos pos su especialidad',
        description:
            'Devuelve una lista de todos los médicos registrados según la especialidad específicada.'
    })
    @Get('Doctor/speciality/:speciality')
    async getBySpeciality(@Param('speciality') specialityName: string) {
        return await this.secretaryService.getBySpeciality(specialityName)
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Elimina un médico',
        description:
            'Cambia el estado de un médico a "inactivo"'
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Delete('Doctor')
    async disableDoctor(@Param('id', ParseUUIDPipe) id: string) {
        return await this.secretaryService.disableDoctor(id)
    }


    /*   SPECIALITY   */

   @ApiOperation({
        summary: 'Obtener todas las especialidades',
        description:
            'Devuelve una lista de todas las especialidades, opcionalmente pudiendo filtrando por nombre. '
    })
    @ApiQuery({
        name: 'nameSpeciality',
        required: false,
        type: 'string',
    })
    @Get('specialitys/speciality')
    async getSpecialitys(@Query('nameSpeciality') nameSpeciality?: string){
        return await this.secretaryService.getSpecialitys(nameSpeciality)
    }


    /*     APPOINTMENTS    */  
    @ApiBearerAuth()
    @Roles(RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @ApiOperation({
        summary: 'Pre-reservar un turno para los pacientes'
    })
    @Post('appointments/pre-reserve/:userId')
    async preReserveAppointment(
            @Body() dto: CreateAppointmentPreReserveDto,
            @Param('userId') userId: string
    ){
        return await this.secretaryService.preReserveAppointment(dto, userId)
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
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Get('appointments/:patientId/list')
    async findAppointmentsByPatientId(
        @Param('patientId', ParseUUIDPipe) patientId: string,
        @Query('date') date?: string,
        @Query('speciality') speciality?: string
    ){
        return await this.secretaryService.findAppointmentsByPatientId(patientId, date, speciality)
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
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Get('appointments/doctor/list')
    async findAgendByDoctor(
        @Param('doctorId', ParseUUIDPipe) doctorId: string,
        @Query('date') date?: string,
        @Query('patientId', ParseUUIDPipe) patientId?: string
    ){
        return await this.secretaryService.findAgendByDoctor(doctorId, date, patientId)
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Ver un turno por ID.'
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        required: true
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Get('appointment/:id')
    async getAppointmentById(@Param('id', ParseUUIDPipe) id: string){
        return this.secretaryService.getAppointmentById(id)
    }
}



