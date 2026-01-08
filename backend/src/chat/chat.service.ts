import { Injectable } from '@nestjs/common';
import { ChatIAService } from './chatIA/chatIA.service';
import { ChatIntent } from './enum/chat.enum';
import { UserService } from '../user/user.service';
import { DoctorService } from '../doctor/doctor.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { SpecialityService } from '../speciality/speciality.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatIAservice: ChatIAService,
    private readonly userService: UserService,
    private readonly doctorService: DoctorService,
    private readonly appointmentService: AppointmentsService,
    private readonly specialityService: SpecialityService
  ){}


async chatMessage(
  userId: string,
  message: string,
): Promise<string> {
  const aiResponse = await this.chatIAservice.detectIntent(message);

  switch (aiResponse.intent) {
    case ChatIntent.GREETING:
      return 'Hola, ¿en qué puedo ayudarte?';

    case ChatIntent.RECOMMEND_SPECIALITY:
      return this.handleRecommendSpeciality(aiResponse.payload);

    case ChatIntent.LIST_DOCTORS:
      return this.handleListDoctors(aiResponse.payload);

    case ChatIntent.LIST_AVAILABLE_SLOTS:
      return this.handleListAvailableSlots(aiResponse.payload);

    case ChatIntent.BOOK_APPOINTMENT:
      return this.handleBookAppointment(userId, aiResponse.payload);

    case ChatIntent.LIST_USER_APPOINTMENTS:
      return this.handleListUserAppointments(userId);

    default:
      return 'No pude entender tu solicitud. ¿Podés reformularla?';
  }
}


private handleRecommendSpeciality(payload?: any): string {
  const symptoms = payload?.symptoms;

  if (!symptoms) {
    return '¿Podrías indicarme qué síntomas estás teniendo?';
  }

  return 'Por los síntomas que mencionás, te recomiendo consultar con un clínico. ¿Querés que te muestre médicos disponibles?';
}


private async handleListDoctors(payload?: any): Promise<string> {
  const speciality = payload?.speciality;

  if (!speciality) {
    return '¿Para qué especialidad querés ver médicos?';
  }

  const doctorsList = await this.specialityService.findByNameWithDoctors(speciality);

  if (!doctorsList.doctors.length) {
    return 'No encontré médicos para esa especialidad.';
  }

  return `Estos son algunos médicos disponibles:\n${doctorsList}\n¿Querés ver turnos de alguno?`;
}


private handleListAvailableSlots(payload?: any): string {
  return 'Voy a buscar los primeros turnos disponibles.';
}

private handleBookAppointment(userId: string, payload?: any): string {
  return 'Perfecto, voy a ayudarte a reservar el turno.';
}

private handleListUserAppointments(userId: string): string {
  return 'Estos son tus turnos asignados.';
}



}
