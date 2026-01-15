import { Injectable } from '@nestjs/common';
import { ChatIntent } from '../enum/chat.enum';


export interface DoctorOption {
  option: number;
  doctorId: string;
  name: string;
}

export interface ChatSession {
  lastIntent?: ChatIntent;

  symptoms?: string[];
  recommendedSpeciality?: string;

  doctorId?: string;
  specialtyId?: string;

  lastDoctorsList?: DoctorOption[];

  awaitingSlotsConfirmation?: boolean;

  awaitingMonth?: boolean;
  selectedMonth?: number;

  awaitingDay?: boolean;
  selectedDay?: number;

  availableHours?: string[];
  awaitingHourSelection?: boolean;
  selectedHour?: string;

  selectedDateTime?: string;
  reason?: string;

  awaitingFinalConfirmation?: boolean;
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
