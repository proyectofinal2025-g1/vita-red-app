import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID del turno pre-reservado',
    example: 'c1a7a2d4-7e3c-4f9c-b1d9-123456789abc',
  })
  @IsUUID()
  appointmentId: string;
}
