import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OptionalAuthGuard } from '../auth/guards/optionalAuth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar mensaje al chatbot' })
  @UseGuards(OptionalAuthGuard) @Post('message')
  async chatMessage(
    @Req() req: any,
    @Body() body: ChatMessageDto) {
    const message = body.message
    if (req.user?.id) {
      const reply = await this.chatService.chatMessage(req.user.id, message);
      return { reply };
    }

    return { reply: 'Hola! Veo que no estás registrado. Para reservar turnos y recibir recomendaciones personalizadas, registrate primero en nuestra plataforma.' };
  }
}