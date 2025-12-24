import { ApiProperty } from '@nestjs/swagger';

export class AdminOverviewResponseDto {
  @ApiProperty({
    example: 120,
    description: 'Cantidad total de usuarios en el sistema',
  })
  totalUsers: number;

  @ApiProperty({
    example: 25,
    description: 'Cantidad total de doctores',
  })
  totalDoctors: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad total de secretarias',
  })
  totalSecretaries: number;

  @ApiProperty({
    example: 340,
    description: 'Cantidad total de turnos (si aplica)',
    required: false,
  })
  totalAppointments?: number;
}
