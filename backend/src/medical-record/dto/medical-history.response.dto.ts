import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class ResponseMedicalHistoryDto {
    @IsNotEmpty()
    @IsUUID()
    patient_id: string

    @IsNotEmpty()
    @IsUUID()
    doctor_id: string

    @IsNotEmpty()
    @IsString()
    reason: string

    @IsNotEmpty()
    @IsString()
    diagnosis: string

    @IsNotEmpty()
    @IsString()
    treatment: string

    @IsOptional()
    @IsString()
    notes: string

    @ApiProperty({ example: 'Juan Pérez' })
    doctorName: string;

    @ApiProperty({ example: 'Cardiología' })
    speciality: string;
}