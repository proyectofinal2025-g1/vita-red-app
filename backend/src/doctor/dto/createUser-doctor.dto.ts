import { ApiProperty } from "@nestjs/swagger";
import { CreateUserDto } from "../../user/dto/create-user.dto";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateUser_DoctorDto extends CreateUserDto {
    @ApiProperty({ example: 'MP-123456' })
    @IsNotEmpty()
    @IsString()
    licence_number: string;

    @ApiProperty({ example: 'uuid-speciality' })
    @IsUUID()
    speciality_id: string;
}