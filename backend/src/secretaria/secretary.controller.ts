import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { SecretaryService } from "./secretary.service";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { UpdateUserDto } from "../user/dto/update-user.dto";
import { RolesEnum } from "../user/enums/roles.enum";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { User } from "../user/entities/user.entity";

@Controller('secretary')
export class SecretaryController {
    constructor(private readonly secretaryService: SecretaryService) { }


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
    @Get()
    async findAll(
        @Query('role', new ParseEnumPipe(RolesEnum, { optional: true })) role?: RolesEnum,
        @Query('is_active',new ParseBoolPipe({ optional: true })) is_active?: boolean,
    ) {
        return this.secretaryService.findAll({ role, is_active });
    }


    
    /* PATIENT */


        @Get(':patientName/')
    async getPatientByName(@Param('patientName') name: string){
        return await this.secretaryService.getPatientByName(name)
    }


     @ApiOperation({
        summary: 'Obtener usuario por ID',
        description:
          'Devuelve el usuario buscado por su ID'
      })
    @Get(':id/')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return await this.secretaryService.findOne(id);
    }


       @ApiOperation({
        summary: 'Crea un usuario nuevo',
        description:
          'Crea y guarda en la base de datos un usuario nuevo'
      })
    @Post('patient')
    async createPatient(@Body() registerDto: CreateUserDto) {
        return await this.secretaryService.createPatient(registerDto)
    }


     @ApiOperation({
        summary: 'Actualiza un usuario',
        description:
          'Actualiza el perfil de un usuario por su ID'
      })
    @Patch(':id')
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: User) {
        return await this.secretaryService.update(id, updateUserDto);
    }


    @ApiOperation({
        summary: 'Elimina un usuario',
        description:
          'Cambia el estado de un usuario(solamente paciente)a "inactivo"'
      })
    @Delete(':id')
    disable(@Param('id') id: string) {
        return this.secretaryService.disable(id);
    }



}