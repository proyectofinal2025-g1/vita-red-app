import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse } from './dto/user-response.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UpdatePasswordDto } from './dto/updatePassword-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesEnum } from './enums/roles.enum';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOkResponse({ description: 'Listado de usuarios', type: UserResponse, isArray: true })
  @Get()
  @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
  @UseGuards(AuthGuard, RolesGuard)
  async findAll(): Promise<UserResponse[]> {
    const userArray = await this.userService.findAll();
    return userArray.map(user => new UserResponse(user))
  }

  @ApiOkResponse({ description: 'Perfil del usuario autenticado', type: UserResponse})
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Request() req: any) {
    return await req.user
  }

  @ApiOkResponse({ description: 'Obtener un usuario', type: UserResponse, })
  @Get(':id')
  @Roles(RolesEnum.SuperAdmin, RolesEnum.Secretary)
  @UseGuards(AuthGuard, RolesGuard)
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponse> {
    const user = await this.userService.findById(id);
    return new UserResponse(user)
  }

  @ApiOkResponse({ description: 'Actualizar un usuario', type: UpdateUserDto, })
  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async disable(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.disable(id);
  }

  @ApiOkResponse({ description: 'Actulizar password del usuario', type: UpdatePasswordDto })
  @Patch(':id/password')
  @UseGuards(AuthGuard)
  updatePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(id, dto);
  }

}
