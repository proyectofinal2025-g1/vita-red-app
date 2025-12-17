import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseBoolPipe, ParseEnumPipe, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RolesEnum } from '../user/enums/roles.enum';
import { Roles } from '../decorators/role.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SuperAdminResponse } from './dto/super-admin.response.dto';

@ApiBearerAuth()
@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) { }

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

  @ApiQuery({ 
    name: 'id', 
    type: 'string', 
    format: 'uuid' ,
    required: true,
    description: 'UUID del usuario para actualizar el estado'
  })
  @Patch('users/:id/status')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async updateActive(@Param('id', ParseUUIDPipe) id: string) {
    return await this.superAdminService.updateActive(id);
  }

  @ApiQuery({
    name: 'id',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'UUID del usuario para actualizar el rol'
  })
  @Patch('users/:id/role')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async updateRole(@Param('id', ParseUUIDPipe) id: string, @Body() role: RolesEnum) {
    return await this.superAdminService.updateRole(id, role);
  }
}
