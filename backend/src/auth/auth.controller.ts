import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/create-user.dto';

@ApiTags('Auth - Endpoints')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(201)
  @Post('register')
  @ApiOperation({ summary: 'Crea un nuevo usuario'})
  async register(@Body() registerDto: CreateUserDto) {
    return await this.authService.register(registerDto);
  }

  @HttpCode(200) 
  @Post('login')
  @ApiOperation({ summary: 'Loguea un usuario'})
  async login(@Body() loginDto: LoginUserDto){
    return await this.authService.login(loginDto)
  }
}
