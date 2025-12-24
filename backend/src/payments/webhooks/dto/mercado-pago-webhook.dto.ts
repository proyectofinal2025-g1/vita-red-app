import { ApiProperty } from '@nestjs/swagger';

export class MercadoPagoWebhookDto {
  @ApiProperty({
    example: 'payment',
    description: 'Tipo de evento enviado por Mercado Pago',
  })
  type: string;

  @ApiProperty({
    example: { id: '123456789' },
    description: 'Datos del evento',
  })
  data: {
    id: string;
  };
}
