import { Controller, Headers, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Request } from 'express';
import { MercadoPagoWebhookService } from './mercado-pago-webhook.service';

type RequestWithRawBody = Request & {
  rawBody: Buffer;
};

@ApiTags('Payments - Webhooks')
@Controller('webhooks/mercadopago')
export class MercadoPagoWebhookController {
  constructor(private readonly webhookService: MercadoPagoWebhookService) {}

  @Post()
  @ApiOperation({
    summary: 'Webhook de Mercado Pago',
    description: 'Recibe notificaciones de eventos de Mercado Pago (pagos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento recibido correctamente',
  })
  async handleWebhook(@Req() req: RequestWithRawBody) {
    await this.webhookService.handle(req.rawBody);
    return { received: true };
  }
}
