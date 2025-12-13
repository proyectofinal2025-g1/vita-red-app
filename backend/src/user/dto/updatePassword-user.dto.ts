import { ApiProperty } from "@nestjs/swagger";

export class UpdatePasswordDto {
  @ApiProperty()
  currentPassword: string;

  @ApiProperty()
  newPassword: string;
}
