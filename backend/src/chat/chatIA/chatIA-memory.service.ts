import { Injectable } from '@nestjs/common';
import { ChatIntent } from '../enum/chat.enum';
import { RolesEnum } from '../../user/enums/roles.enum';


export interface DoctorOption {
  option: number;
  doctorId: string;
  name: string;
}

export interface ChatSession {
  userId?: string;
  lastIntent?: ChatIntent;

  symptoms?: string[];
  recommendedSpeciality?: string;
  awaitingRecommendConfirmation?: boolean;
  awaitingReserveConfirmation?: boolean;

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



  awaitingAuthConfirmation?: boolean;
  awaitingRegisterEmail?: boolean;
  awaitingRegisterPassword?: boolean;
  awaitingRegisterConfirmPassword?: boolean;
  awaitingRegisterFirstName?: boolean;
  awaitingRegisterLastName?: boolean;
  awaitingRegisterDni?: boolean;

  registerEmail?: string;
  registerPassword?: string;
  registerConfirmPassword?: string;
  registerFirstName?: string;
  registerLastName?: string;
  registerDni?: string;

  userAuthenticated?: boolean;
  realUserId?: string

  awaitingUpdateField?: boolean;
  awaitingUpdateValue?: boolean;
  pendingUpdateField?: 'first_name' | 'last_name' | 'email' | 'password';
  pendingUpdateValue?: string;
  awaitingUserIdentification?: boolean
  userRole: RolesEnum;
}




@Injectable()
export class ChatSessionService {
  private sessions = new Map<string, ChatSession>();

  get(userId: string): ChatSession {
  return this.sessions.get(userId) || {
    userId,
    doctorId: undefined,
    selectedDay: undefined,
    selectedMonth: undefined,
    availableHours: [],
    awaitingDay: false,
    awaitingHourSelection: false,
    userRole: RolesEnum.User
  };
}


  set(userId: string, session: ChatSession) {
    this.sessions.set(userId, session);
  }

  clear(userId: string) {
    this.sessions.delete(userId);
  }
}
