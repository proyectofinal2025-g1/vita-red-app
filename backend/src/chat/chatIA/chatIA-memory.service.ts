import { Injectable } from '@nestjs/common';
import { ChatIntent } from '../enum/chat.enum';

export interface ChatSession {
  lastIntent?: ChatIntent;
  symptoms?: string[];
  recommendedSpeciality?: string;
  doctorId?: string;
}

@Injectable()
export class ChatSessionService {
  private sessions = new Map<string, ChatSession>();

  get(userId: string): ChatSession {
    return this.sessions.get(userId) || {};
  }

  set(userId: string, session: ChatSession) {
    this.sessions.set(userId, session);
  }

  clear(userId: string) {
    this.sessions.delete(userId);
  }
}
