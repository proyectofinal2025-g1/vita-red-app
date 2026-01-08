import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ example: "hola chat, me podes ayudar?" })
  @IsString()
  @IsNotEmpty()
  message: string;
}
