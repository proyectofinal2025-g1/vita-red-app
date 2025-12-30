import { ApiProperty } from '@nestjs/swagger';

export class PreReserveAppointmentResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del turno pre-reservado',
  })
  appointmentId: string;

  @ApiProperty({
    example: '2025-01-20T10:15:00.000Z',
    description: 'Fecha y hora de expiración de la pre-reserva',
  })
  expiresAt: Date;

  @ApiProperty({
    example: 20000,
    description: 'Precio de la consulta al momento de la reserva',
  })
  price: number;
}
