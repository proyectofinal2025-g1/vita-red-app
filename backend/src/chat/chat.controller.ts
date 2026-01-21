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
  @Post('message')
@UseGuards(OptionalAuthGuard)
async chatMessage(@Req() req: any, @Body() body: ChatMessageDto) {
  
console.log('AUTH HEADER', req.headers.authorization);
console.log('REQ.USER', req.user);


  const chatUserId = req.user?.id ?? `anon-${req.ip}`;

  const reply = await this.chatService.chatMessage(
    chatUserId,
    body.message,
    req.user ? { id: req.user.id } : undefined
  );

  return { reply };
}


}
