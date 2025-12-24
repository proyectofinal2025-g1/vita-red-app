import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { RolesEnum } from "../user/enums/roles.enum";
import { SecretaryService } from "./secretary.service";
import { User } from "../user/entities/user.entity";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { CreateDoctorDto } from "../doctor/dto/create-doctor.dto";
import { Roles } from "../decorators/role.decorator";
import { AuthGuard } from "../auth/guards/auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";

@Controller('secretary')
export class SecretaryController {
    constructor(private readonly secretaryService: SecretaryService) { }

/* PROBANDOO */
    
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


    @ApiOperation({
        summary: 'Crea un usuario nuevo',
        description:
            'Crea y guarda en la base de datos un usuario nuevo'
    })
   // @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
   // @UseGuards(AuthGuard, RolesGuard)
    @Post('patient')
    async createPatient(@Body() registerDto: CreateUserDto) {
        return await this.secretaryService.createPatient(registerDto)
    }


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
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Get('Doctor/:name')
    async getDoctors(
        @Query('doctorName') name?: string
    ) {
        return await this.secretaryService.getDoctors(name)
    }

    @ApiOperation({
        summary: 'Obtener médicos pos su especialidad',
        description:
            'Devuelve una lista de todos los médicos registrados según la especialidad específicada.'
    })
    @Get('Doctor/speciality/:speciality')
    async getBySpeciality(@Param('speciality') specialityName: string) {
        return await this.secretaryService.getBySpeciality(specialityName)
    }

    @ApiOperation({
        summary: 'Elimina un médico',
        description:
            'Cambia el estado de un médico a "inactivo"'
    })
    @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
    @UseGuards(AuthGuard, RolesGuard)
    @Delete('Doctor')
    async disableDoctor(id: string) {
        return await this.secretaryService.disableDoctor(id)
    }

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

}



