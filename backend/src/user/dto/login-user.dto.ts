import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario registrado',
    example: 'usuario@mail.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiContraseñaSegura123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
