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
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      max_tokens: 150,
      messages: [
        { role: 'system', content: this.systemPrompt() },
        { role: 'user', content: message },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) return { intent: ChatIntent.FALLBACK };

    try {
      return JSON.parse(content);
    } catch {
      return { intent: ChatIntent.FALLBACK };
    }
  }

  private systemPrompt(): string {
    return `
You are a medical administrative chatbot.

You DO NOT diagnose.
You ONLY help users schedule medical appointments.

Tasks:
- Detect intent
- Extract symptoms if mentioned
- Suggest ONE medical speciality (administrative)

Allowed intents:
- greeting
- recommend_speciality
- list_doctors
- list_available_slots
- book_appointment
- list_user_appointments
- fallback

Rules:
- Always return valid JSON
- Never add explanations
- If symptoms exist, extract them as array of strings
- Suggested speciality must be generic (clinico, pediatra, ginecologo, etc.)

Response format:
{
  "intent": "<intent>",
  "payload": {
    "symptoms"?: string[],
    "suggestedSpeciality"?: string
  }
}

Language: Spanish.
`;
  }
}
