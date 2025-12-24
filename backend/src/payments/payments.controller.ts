import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ResponsePaymentDto } from './dto/response-payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('preference')
  @ApiOperation({
    summary: 'Crear preference de pago para un turno',
    description:
      'Crea una preference de Mercado Pago para un turno pre-reservado',
  })
  @ApiResponse({
    status: 201,
    description: 'Preference creada correctamente',
    type: ResponsePaymentDto,
  })
  async createPreference(
    @Body() dto: CreatePaymentDto,
  ): Promise<ResponsePaymentDto> {
    return this.paymentsService.createPreference(dto);
  }
}
