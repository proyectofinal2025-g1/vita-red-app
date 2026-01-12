import { ChatIntent } from '../enum/chat.enum';

export interface ChatResponse {
  intent: ChatIntent;
  payload?: Record<string, any>;
}