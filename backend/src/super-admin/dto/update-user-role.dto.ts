import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RolesEnum } from '../../user/enums/roles.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: RolesEnum,
    description: 'Nuevo rol del usuario (no puede ser SUPER_ADMIN)',
    example: RolesEnum.Secretary,
  })
  @IsEnum(RolesEnum)
  role: RolesEnum;
}
