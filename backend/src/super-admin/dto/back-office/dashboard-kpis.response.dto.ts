import { ApiProperty } from '@nestjs/swagger';

export class DashboardKpisResponseDto {
  @ApiProperty({
    example: 320,
    description: 'Número total de citas registradas en el sistema',
  })
  totalAppointments: number;

  @ApiProperty({
    example: 42,
    description: 'Número total de citas para el mes actual',
  })
  appointmentsThisMonth: number;

  @ApiProperty({
    example: 280,
    description: 'Número total de citas confirmadas (pagadas)',
  })
  confirmedAppointments: number;

  @ApiProperty({
    example: 40,
    description: 'Número total de citas canceladas',
  })
  cancelledAppointments: number;

  @ApiProperty({
    example: 125000,
    description: 'Ingresos totales generados por citas confirmadas (pagadas)',
  })
  totalRevenue: number;
}
