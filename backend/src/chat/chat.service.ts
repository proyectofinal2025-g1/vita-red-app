import { Injectable } from '@nestjs/common';
import { ChatIAService } from './chatIA/chatIA.service';
import { ChatIntent } from './enum/chat.enum';
import { UserService } from '../user/user.service';
import { DoctorService } from '../doctor/doctor.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { SpecialityService } from '../speciality/speciality.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatIAservice: ChatIAService,
    private readonly userService: UserService,
    private readonly doctorService: DoctorService,
    private readonly appointmentsService: AppointmentsService,
    private readonly specialityService: SpecialityService,
    private readonly paymentsService: PaymentsService
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
  const message = payload?.message;

  if (!message || message.trim() === '') {
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


private async handleListAvailableSlots(payload?: any): Promise<string> {
  const doctorId = payload?.doctorId;

  if (!doctorId) {
    return '¿De qué médico querés ver los turnos disponibles?';
  }

  const appointments = await this.doctorService.getAppointments(doctorId);

  if (!appointments.length) {
    return 'Ese médico no tiene turnos disponibles en este momento.';
  }

  const list = appointments
    .slice(0, 5)
    .map(s => {
      const fechaObj = new Date(s.date);
      
      const fecha = fechaObj.toLocaleDateString('es-AR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });

      const hora = fechaObj.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return `- ${fecha} a las ${hora} hs`;
    })
    .join('\n');

  return `Estos son los primeros turnos disponibles:\n${list}\n\n¿Querés reservar alguno?`;
}

private async handleBookAppointment(
  userId: string,
  payload?: any,
): Promise<string> {
  const { doctorId, dateTime, specialtyId } = payload || {};

  if (!doctorId || !dateTime) {
    return 'Necesito que elijas un médico y un horario para continuar.';
  }

  try {
    const preReserve = await this.appointmentsService.preReserveAppointment(
      { doctorId, dateTime, specialtyId },
      userId,
    );

    const payment = await this.paymentsService.createPreference({
      appointmentId: preReserve.appointmentId,
    });

    return `Tu turno fue pre-reservado exitosamente. 
Por favor, completá el pago para confirmarlo: ${payment.initPoint}
El turno expirará el ${preReserve.expiresAt.toLocaleTimeString()} si no se completa el pago.`;
  } catch (err: any) {
    return `No se pudo reservar el turno: ${err.message}`;
  }
}


private handleListUserAppointments(userId: string): string {
  return 'Estos son tus turnos asignados.';
}



}
