import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
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
    description: 'Nombre del usuario', 
    example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ description: 'DNI del usuario',
    example: '12345678' })
  @IsString()
  @IsNotEmpty()
  dni: string;


}