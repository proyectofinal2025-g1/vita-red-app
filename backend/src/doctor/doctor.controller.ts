import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { Roles } from '../decorators/role.decorator';
import { RolesEnum } from '../user/enums/roles.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUser_DoctorDto } from './dto/createUser-doctor.dto';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService
  ) { }

  @ApiOperation({ summary: 'Crear un usuario y perfil de médico' })
  @ApiOkResponse({type: 'string'})
  @Post('register')
  async createDoctor(@Body() dto: CreateUser_DoctorDto) {
    return this.doctorService.createDoctorWithUser(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un perfil de médico' })
  @ApiCreatedResponse({ type: DoctorResponseDto })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async create(@Body() dto: CreateDoctorDto) {
    return await this.doctorService.create(dto);
  }

  @ApiOperation({ summary: 'Obtener todos los médicos' })
  @ApiOkResponse({ type: [DoctorResponseDto] })
  @Get()
  async findAll() {
    return await this.doctorService.findAll();
  }

  @Get('search')
  @ApiOkResponse({ type: DoctorResponseDto })
  async findByDoctorName(@Query('name') name: string) {
    return await this.doctorService.findByDoctorName(name)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el perfil del médico logueado' })
  @ApiOkResponse({ type: DoctorResponseDto })
  @Roles(RolesEnum.Medic)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('me')
  async meDoctor(@Req() req: any) {
    return await this.doctorService.findMeDoctor(req.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un médico por ID' })
  @ApiOkResponse({ type: DoctorResponseDto })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.doctorService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un médico' })
  @ApiOkResponse({ type: DoctorResponseDto })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctorService.update(id, {
      licence_number: dto.licence_number,
      speciality_id: dto.speciality_id,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un médico' })
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.remove(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver turnos asignados' })
  @Roles(RolesEnum.Medic, RolesEnum.User)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('appointments/list')
  async getAppointments(@Req() req: any){
   const id = req.user.sub
console.log('id:',id);
   return await this.doctorService.getAppointments(id)
}

}
