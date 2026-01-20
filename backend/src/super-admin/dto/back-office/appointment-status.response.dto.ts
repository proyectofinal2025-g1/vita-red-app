import { ApiProperty } from '@nestjs/swagger';

export class AppointmentStatusResponseDto {
  @ApiProperty({
    example: 'CONFIRMED',
    description: 'Estado de los turnos',
  })
  status: string;

  @ApiProperty({
    example: 120,
    description: 'Totalde turnos con sus estados',
  })
  total: number; 
}
