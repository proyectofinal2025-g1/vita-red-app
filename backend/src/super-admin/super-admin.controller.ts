import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseBoolPipe, ParseEnumPipe, UseGuards, ParseUUIDPipe } from '@nestjs/common';
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

@ApiBearerAuth()
@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) { }

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
    summary: 'Obtener todas las secretarias',
    description:
      'Devuelve una lista de todas las secretarias registradas en el sistema. ' +
      'Endpoint exclusivo para SUPER_ADMIN.',
  })
  @Get('secretaries')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async findAllSecretaries() {
    const secretaries = await this.superAdminService.findAll(RolesEnum.Secretary);
    return secretaries.map(user => new SuperAdminResponse(user));
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
}
