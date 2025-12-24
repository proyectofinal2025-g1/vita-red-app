import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentPreferenceResponseDto {
  @ApiProperty({
    description: 'URL de Mercado Pago para iniciar el checkout',
    example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?...',
  })
  initPoint: string;
}
