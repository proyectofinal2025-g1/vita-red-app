import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto.';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('message')
  async chatMessahe(
    @Req() req: any,
    @Body() body: ChatMessageDto
  ) {
    const userId = req.user.id
    const message = body.message

    return {
      reply: await this.chatService.chatMessage(userId, message),
    };
  }

}
