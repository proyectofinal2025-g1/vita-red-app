import { ApiProperty } from '@nestjs/swagger';

export class MonthlyRevenueResponseDto {
  @ApiProperty({
    example: 'January',
    description: 'Nombre del mes',
  })
  month: string;

  @ApiProperty({
    example: 25000,
    description:
      'Ingresos totales generados por citas confirmadas (pagadas) en el mes determinado',
  })
  revenue: number; 
}
