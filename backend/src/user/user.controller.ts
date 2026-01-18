import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse } from './dto/user-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UpdatePasswordDto } from './dto/updatePassword-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesEnum } from './enums/roles.enum';
import { Roles } from '../decorators/role.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({
    description: 'Perfil del usuario autenticado',
    type: UserResponse,
  })
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Request() req: any) {
    const userId = req.user.sub;
    const user = await this.userService.findById(userId);
    return new UserResponse(user);
  }

  @ApiOkResponse({
    description: 'Actualizar perfil del usuario autenticado',
    schema: {
      example: {
        message: 'Perfil actualizado correctamente',
      },
    },
    type: UserResponse,
  })
  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub;
    await this.userService.update(userId, updateUserDto);
    return { message: 'Perfil actualizado correctamente' };
  }

  @Patch('me/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2000000,
            message: 'Superas el peso maximo de 2MB',
          }),
          new FileTypeValidator({ fileType: /(.jpg|.png|.svg|.webp|.jpeg)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user.sub;
    const user = await this.userService.updateAvatar(userId, file);
    return new UserResponse(user);
  }

  @ApiOkResponse({ description: 'Obtener un usuario', type: UserResponse })
  @Get(':id')
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponse> {
    const user = await this.userService.findById(id);
    return new UserResponse(user);
  }

  @ApiOkResponse({
    description: 'Listado de usuarios',
    type: UserResponse,
    isArray: true,
  })
  @Get()
  @Roles(RolesEnum.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  async findAll(): Promise<UserResponse[]> {
    const userArray = await this.userService.findAll();
    return userArray.map((user) => new UserResponse(user));
  }

  @ApiOkResponse({ description: 'Actualizar un usuario', type: UpdateUserDto })
  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async disable(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.disable(id);
  }

  @ApiOkResponse({
    description: 'Actulizar password del usuario',
    type: UpdatePasswordDto,
  })
  @Patch(':id/password')
  @UseGuards(AuthGuard)
  updatePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(id, dto);
  }
}
