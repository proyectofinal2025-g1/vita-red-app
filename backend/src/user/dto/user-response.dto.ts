import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entities/user.entity";
import { RolesEnum } from "../enums/roles.enum";

export class UserResponse {
  @ApiProperty({
    example: 'c1f4a9a6-9f2b-4b2f-bc4e-9e7c0c9c4a11',
    description: 'UUID del usuario',
  })
  id: string;

  @ApiProperty({ example: 'Juan' })
  first_name: string;

  @ApiProperty({ example: 'Pérez' })
  last_name: string;

  @ApiProperty({ example: '12345678' })
  dni: string;

  @ApiProperty({ example: 'juan@mail.com' })
  email: string;

  @ApiProperty({
    enum: RolesEnum,
    example: RolesEnum.User,
  })
  role: RolesEnum;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/v123456/users/avatars/a3f1c2e4.jpg',
    description: 'URL pública de la imagen de perfil del usuario',
    required: false,
  })
  profileImageUrl?: string;
  
  constructor(user: User) {
    this.id = user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.dni = user.dni;
    this.email = user.email;
    this.role = user.role;
    this.profileImageUrl = user.profileImageUrl
  }
}