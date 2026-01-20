import { ApiProperty } from '@nestjs/swagger';

export class MonthlyAppointmentsResponseDto {
  @ApiProperty({
    example: 'January',
    description: 'Nombre del mes',
  })
  month: string;

  @ApiProperty({
    example: 32,
    description: 'Total de citas para el mes determinado',
  })
  totalAppointments: number; 
}
