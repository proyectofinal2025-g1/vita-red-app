import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatIntent } from '../enum/chat.enum';
import { ChatResponse } from '../dto/response-chat.dto';
import { normalizeText } from '../helpers/text.helper';

@Injectable()
export class ChatIAService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async detectIntent(message: string): Promise<ChatResponse> {
     const normalized = normalizeText(message);

  if (['si', 'sí', 'dale', 'ok', 'okey', 'claro', 'confirmar', 'de una', 'de 1'].includes(normalized)) {
    return { intent: ChatIntent.CONFIRM };
  }

  if (['no', 'nop', 'mejor no', 'cancelar'].includes(normalized)) {
    return { intent: ChatIntent.FALLBACK };
  }

  if (normalized.length <= 3) {
    return { intent: ChatIntent.FALLBACK };
  }

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
- Extract relevant entities depending on the intent

Allowed intents:
- greeting
- register
- update
- recommend_speciality
- list_doctors
- list_available_slots
- book_appointment
- list_user_appointments
- fallback

Rules:
- Always return valid JSON
- Never add explanations
- Language: Spanish

Entity extraction rules:
- "register": when the user wants to create an account or register as a new user

- If intent is "recommend_speciality":
  - Extract symptoms as array of strings
  - Suggest ONE generic speciality (clinico, pediatria, cardiologia, etc.)

- If intent is "list_doctors":
  - If a speciality is mentioned, extract it as "speciality"

- If intent is "list_available_slots":
  - Extract doctor name or index if mentioned

- If intent is "book_appointment":
  - Extract doctor and date/time if mentioned

Response format:
{
  "intent": "<intent>",
  "payload": {
    "symptoms"?: string[],
    "suggestedSpeciality"?: string,
    "speciality"?: string,
    "doctorId"?: string,
    "dateTime"?: string
  }
}

Language: Spanish.
`;
  }
}
