import { Injectable } from "@nestjs/common";
import { ChatIntent } from "./enum/chat.enum";
import { ChatIAService } from "./chatIA/chatIA.service";
import { ChatSessionService } from "./chatIA/chatIA-memory.service";
import { SpecialityService } from "../speciality/speciality.service";
import { DoctorService } from "../doctor/doctor.service";
import { AppointmentsService } from "../appointments/appointments.service";
import { PaymentsService } from "../payments/payments.service";

@Injectable()
export class ChatService {
  constructor(
    private readonly chatIA: ChatIAService,
    private readonly sessionService: ChatSessionService,
    private readonly specialityService: SpecialityService,
    private readonly doctorService: DoctorService,
    private readonly appointmentsService: AppointmentsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async chatMessage(userId: string, message: string): Promise<string> {
    const session = this.sessionService.get(userId);
    const ai = await this.chatIA.detectIntent(message);

    session.lastIntent = ai.intent;

    switch (ai.intent) {
      case ChatIntent.GREETING:
        return 'Hola, ¿en qué puedo ayudarte?';

      case ChatIntent.RECOMMEND_SPECIALITY:
        return this.handleRecommendSpeciality(userId, ai.payload);

      case ChatIntent.LIST_DOCTORS:
        return this.handleListDoctors(userId);

      case ChatIntent.LIST_AVAILABLE_SLOTS:
        return this.handleListAvailableSlots(userId);

      case ChatIntent.BOOK_APPOINTMENT:
        return this.handleBookAppointment(userId, ai.payload);

      case ChatIntent.LIST_USER_APPOINTMENTS:
        return 'Estos son tus turnos asignados.';

      default:
        return 'No terminé de entenderte. ¿Podés reformular?';
    }
  }

  private handleRecommendSpeciality(userId: string, payload?: any): string {
    const session = this.sessionService.get(userId);
    const symptoms = payload?.symptoms;
    const speciality = payload?.suggestedSpeciality;

    if (!symptoms || symptoms.length === 0) {
      return '¿Qué síntomas estás teniendo?';
    }

    session.symptoms = symptoms;
    session.recommendedSpeciality = speciality || 'clinico';
    this.sessionService.set(userId, session);

    return `Por los síntomas que mencionás (${symptoms.join(', ')}), lo más adecuado es un médico ${session.recommendedSpeciality}. ¿Querés que te muestre médicos disponibles?`;
  }

  private async handleListDoctors(userId: string): Promise<string> {
    const session = this.sessionService.get(userId);

    if (!session.recommendedSpeciality) {
      return 'Primero necesito saber qué tipo de médico estás buscando.';
    }

    const speciality = await this.specialityService.findByNameWithDoctors(
      session.recommendedSpeciality,
    );

    if (!speciality || !speciality.doctors.length) {
      return 'No encontré médicos disponibles para esa especialidad.';
    }

    const list = speciality.doctors
      .slice(0, 5)
      .map(d => `- ${d.first_name} ${d.last_name}`)
      .join('\n');

    return `Estos son algunos médicos disponibles:\n${list}\n¿Querés ver los turnos de alguno?`;
  }

  private async handleListAvailableSlots(userId: string): Promise<string> {
    const session = this.sessionService.get(userId);

    if (!session.doctorId) {
      return '¿De qué médico querés ver los turnos?';
    }

    const slots = await this.doctorService.getAppointments(session.doctorId);

    if (!slots.length) {
      return 'Ese médico no tiene turnos disponibles.';
    }

    const list = slots.slice(0, 5).map(s => {
      const d = new Date(s.date);
      return `- ${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    }).join('\n');

    return `Turnos disponibles:\n${list}\n¿Querés reservar alguno?`;
  }

  private async handleBookAppointment(userId: string, payload?: any): Promise<string> {
    const { doctorId, dateTime } = payload || {};

    if (!doctorId || !dateTime) {
      return 'Necesito que elijas un médico y un horario.';
    }

    const preReserve = await this.appointmentsService.preReserveAppointment(
      { doctorId, dateTime },
      userId,
    );

    const payment = await this.paymentsService.createPreference({
      appointmentId: preReserve.appointmentId,
    });

    return `Tu turno fue pre-reservado. Completá el pago para confirmarlo:\n${payment.initPoint}`;
  }
}
