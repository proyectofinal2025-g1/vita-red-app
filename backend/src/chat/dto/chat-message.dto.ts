import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ example: "hola chat, me podes ayudar?" })
  @IsString()
  @IsNotEmpty()
  message: string;

  
  @ApiPropertyOptional({
    example: 'uuid',
    description: 'ID de sesión del chat (opcional)',
  })
  @IsOptional()
  @IsString()
  chatUserId?: string;
}
