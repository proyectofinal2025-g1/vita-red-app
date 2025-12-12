import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class CreateUserDto {

  @ApiProperty({
    description: 'Correo electrónico del usuario (único)',
    example: 'juanperez@mail.com',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (debe ser fuerte)',
    example: 'MiPass@123',
  })
  @IsString()
  @Length(3, 15)
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Confirmación de la contraseña',
    example: 'MiPass@123',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    description:
      'Indica si el usuario está activo en la aplicación (no se permite definirlo manualmente)',
    example: false,
  })
  @IsEmpty()
  is_active: boolean;
}