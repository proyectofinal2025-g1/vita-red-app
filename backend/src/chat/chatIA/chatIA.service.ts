import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatIntent } from '../enum/chat.enum';
import { ChatResponse } from '../dto/response-chat.dto';

@Injectable()
export class ChatIAService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async detectIntent(message: string): Promise<ChatResponse> {
        const iaResponse = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: this.systemPrompt(),
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
            temperature: 0.2,
            max_completion_tokens: 50
        });

        const content = iaResponse?.choices[0]?.message?.content?.trim();

        if (!content) {
            return { intent: ChatIntent.FALLBACK };
        }

        try {
            return JSON.parse(content);
        } catch {
            return { intent: ChatIntent.FALLBACK };
        }
    }

    private systemPrompt(): string {
        return `
You are a medical administrative assistant.

Allowed intents:
- greeting
- recommend_speciality
- list_doctors
- list_available_slots
- book_appointment
- list_user_appointments
- fallback

Rules:
- You do NOT provide medical diagnosis or advice.
- You ONLY return JSON.
- You MUST return one of the allowed intents.
- If unsure, return fallback.

The user speaks Spanish.

Response format:
{
  "intent": "<one of the allowed intents>",
  "payload": { ...optional }
}
`;
    }
}
