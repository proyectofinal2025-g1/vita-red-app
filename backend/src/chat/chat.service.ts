import { Injectable } from "@nestjs/common";
import { ChatIntent } from "./enum/chat.enum";
import { ChatIAService } from "./chatIA/chatIA.service";
import { ChatSessionService } from "./chatIA/chatIA-memory.service";
import { SpecialityService } from "../speciality/speciality.service";
import { DoctorService } from "../doctor/doctor.service";
import { AppointmentsService } from "../appointments/appointments.service";
import { PaymentsService } from "../payments/payments.service";
import { normalizeText } from "./helpers/text.helper";
import { resolveSpecialityName } from "./helpers/specialitiesWithoutAccent.helper";

@Injectable()
export class ChatService {
  constructor(
    private readonly chatIA: ChatIAService,
    private readonly sessionService: ChatSessionService,
    private readonly specialityService: SpecialityService,
    private readonly doctorService: DoctorService,
    private readonly appointmentsService: AppointmentsService,
    private readonly paymentsService: PaymentsService,
  ) { }

  async chatMessage(userId: string, message: string): Promise<string> {

    const session = this.sessionService.get(userId);
    const normalized = normalizeText(message);

    const looksLikeNumber = /^\d+$/.test(normalized);
    const looksLikeNewIntent =
      normalized.includes('medic') ||
      normalized.includes('especial') ||
      normalized.includes('pediatr') ||
      normalized.includes('clinic') ||
      normalized.includes('cardio');

    if (
      session.lastDoctorsList &&
      session.lastDoctorsList.length > 0 &&
      !looksLikeNumber &&
      looksLikeNewIntent
    ) {
      this.sessionService.clear(userId);
    }

    if (session.lastDoctorsList && session.lastDoctorsList.length > 0) {
  return this.handleDoctorSelection(userId, message);
}

if (session.awaitingSlotsConfirmation) {
  return this.handleSlotsConfirmation(userId, message);
}

if (session.awaitingMonth) {
  return this.handleMonthSelection(userId, message);
}

if (session.awaitingDay) {
  return this.handleDaySelection(userId, message);
}

if (session.awaitingHourSelection) {
  return this.handleHourSelection(userId, message);
}

if (session.awaitingFinalConfirmation) {
  return this.handleFinalConfirmation(userId, message);
}

    const ai = await this.chatIA.detectIntent(message);

    session.lastIntent = ai.intent;

    switch (ai.intent) {
      case ChatIntent.GREETING:
        return 'Hola, ¿en qué puedo ayudarte?';

      case ChatIntent.RECOMMEND_SPECIALITY:
        return this.handleRecommendSpeciality(userId, ai.payload);

      case ChatIntent.LIST_DOCTORS:
        return this.handleListDoctors(userId, ai.payload);

      case ChatIntent.LIST_AVAILABLE_SLOTS:
        return this.handleListAvailableSlots(userId);

      case ChatIntent.BOOK_APPOINTMENT:
        return this.handleBookAppointment(userId, ai.payload);

      case ChatIntent.LIST_USER_APPOINTMENTS:
        return 'Estos son tus turnos asignados.';

      case ChatIntent.LIST_USER_APPOINTMENTS:
        return await this.handleListUserAppointments(userId);

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

  private async handleListDoctors(
  userId: string,
  payload?: any
): Promise<string> {
  const session = this.sessionService.get(userId);
  const rawSpeciality = payload?.speciality ?? session.recommendedSpeciality;

  if (!rawSpeciality) {
    return '¿Qué especialidad estás buscando? Por ejemplo: pediatría, clínica, cardiología.';
  }

  const normalizedSpeciality = normalizeText(rawSpeciality);
  const dbSpecialityName = resolveSpecialityName(normalizedSpeciality);

  const speciality =
    await this.specialityService.findByNameWithDoctorsChat(dbSpecialityName);

  if (!speciality) {
    return `No encontré la especialidad "${rawSpeciality}".`;
  }

  if (!speciality.doctors || !speciality.doctors.length) {
    return `No encontré médicos disponibles para "${speciality.name}".`;
  }

  session.recommendedSpeciality = rawSpeciality;
  session.specialtyId = speciality.id

  const doctorsToShow = speciality.doctors.slice(0, 5);

  session.lastDoctorsList = doctorsToShow.map((d, index) => ({
    option: index + 1,
    doctorId: d.id,
    name: `${d.first_name} ${d.last_name}`,
  }));

  this.sessionService.set(userId, session);

  const list = doctorsToShow
    .map((d, i) => `${i + 1}) ${d.first_name} ${d.last_name}`)
    .join('\n');

  return (
    `Médicos disponibles para ${speciality.name}:\n` +
    `${list}\n\n` +
    `Elegí un profesional para seguir.`
  );
}




  private handleDoctorSelection(userId: string, message: string): string {
    const session = this.sessionService.get(userId);

    const option = parseInt(message, 10);

    if (isNaN(option)) {
      return 'Por favor, elegí un número del listado.';
    }

    const selected = session.lastDoctorsList?.find(
      d => d.option === option
    );

    if (!selected) {
      return 'Ese número no corresponde a ningún médico del listado.';
    }


    session.doctorId = selected.doctorId;
    session.awaitingSlotsConfirmation = true;
    delete session.lastDoctorsList;

    this.sessionService.set(userId, session);

    return `Perfecto. ¿Querés ver los turnos disponibles con ${selected.name}?`;
  }


 private handleSlotsConfirmation(
  userId: string,
  message: string
): string {
  const session = this.sessionService.get(userId);
  const normalized = normalizeText(message);

  if (['si', 'sí', 's', 'ok', 'dale'].includes(normalized)) {
    session.awaitingSlotsConfirmation = false;
    session.awaitingMonth = true;

    this.sessionService.set(userId, session);

    return 'Perfecto. ¿Para qué mes querés el turno? (1 a 12)';
  }

  if (['no', 'n', 'cancelar'].includes(normalized)) {
    this.sessionService.clear(userId);
    return 'Está bien. Si querés, puedo ayudarte a buscar otro médico o especialidad.';
  }

  return 'Respondé con "sí" o "no", por favor.';
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

  private async handleListUserAppointments(userId: string): Promise<string> {
    const appointments = await this.appointmentsService.findAllByPatientId(userId);
    console.log("holaa")

    if (!appointments || appointments.length === 0) {
      return 'No tenés turnos asignados actualmente.';
    }

    const list = appointments
      .map((app) => {
        const date = new Date(app.date);
        const dateStr = date.toLocaleDateString('es-AR');
        const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

        return `- ${dateStr} a las ${timeStr} con el Dr. ${app.doctor.fullName}`;
      })
      .join('\n');

    return `Estos son tus turnos asignados:\n${list}`;
  }


  private handleMonthSelection(userId: string, message: string): string {
    const session = this.sessionService.get(userId);
    const month = parseInt(message, 10);

    if (isNaN(month) || month < 1 || month > 12) {
      return 'Por favor, ingresá un mes válido (1 a 12).';
    }

    session.selectedMonth = month;
    session.awaitingMonth = false;
    session.awaitingDay = true;

    this.sessionService.set(userId, session);

    return `Perfecto. ¿Qué día del mes ${month} querés?`;
  }


private async handleDaySelection(
  userId: string,
  message: string
): Promise<string> {
  const session = this.sessionService.get(userId);
  const day = parseInt(message, 10);

  if (isNaN(day) || day < 1 || day > 31) {
    return 'Ingresá un día válido.';
  }

  const year = new Date().getFullYear();
  const monthIndex = session.selectedMonth! - 1;

  const selectedDate = new Date(year, monthIndex, day);
  const dayOfWeek = selectedDate.getDay(); // 0 = domingo, 6 = sábado

  // 🚫 BLOQUEO FIN DE SEMANA
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'Ese día es fin de semana. Por favor, elegí un día de lunes a viernes.';
  }

  session.selectedDay = day;
  session.awaitingDay = false;

  this.sessionService.set(userId, session);

  return this.handleAvailableHours(userId);
}



private async handleAvailableHours(userId: string): Promise<string> {
  const session = this.sessionService.get(userId);

  const mockHours = ['09:00', '10:30', '14:00', '16:30'];

  session.availableHours = mockHours;
  session.awaitingHourSelection = true;

  this.sessionService.set(userId, session);

  const list = mockHours
    .map((h, i) => `${i + 1}) ${h}`)
    .join('\n');

  return (
    `Horarios disponibles el ${session.selectedDay}/${session.selectedMonth}:\n` +
    `${list}\n\n` +
    `Elegí un número para reservar.`
  );
}


private handleHourSelection(userId: string, message: string): string {
  const session = this.sessionService.get(userId);
  const option = parseInt(message, 10);

  if (
    isNaN(option) ||
    !session.availableHours ||
    option < 1 ||
    option > session.availableHours.length
  ) {
    return 'Por favor, elegí un número válido del listado.';
  }

  const selectedHour = session.availableHours[option - 1];

  const year = new Date().getFullYear();
  const month = String(session.selectedMonth).padStart(2, '0');
  const day = String(session.selectedDay).padStart(2, '0');

  session.selectedHour = selectedHour;
  session.selectedDateTime = `${year}-${month}-${day}T${selectedHour}`;
  session.awaitingHourSelection = false;
  session.awaitingFinalConfirmation = true;

  this.sessionService.set(userId, session);

  return (
    `Perfecto. Confirmo:\n` +
    `📅 ${day}/${month}/${year}\n` +
    `⏰ ${selectedHour}\n\n` +
    `¿Querés confirmar el turno?`
  );
}


private async confirmAppointment(userId: string): Promise<string> {
  const session = this.sessionService.get(userId);

  const preReserve = await this.appointmentsService.preReserveAppointment(
    {
      doctorId: session.doctorId!,
      specialtyId: session.specialtyId,
      dateTime: session.selectedDateTime!,
      reason: session.reason,
    },
    userId, 
  );

  this.sessionService.clear(userId);

  return (
    `✅ Turno pre-reservado con éxito.\n\n` +
    `📅 Vence el: ${preReserve.expiresAt.toLocaleString('es-AR')}\n` +
    `💰 Precio: $${preReserve.price}\n\n` +
    `Para confirmarlo, continuamos con el pago en el próximo paso.`
  );
}


private async handleFinalConfirmation(
  userId: string,
  message: string
): Promise<string> {
  const session = this.sessionService.get(userId);
  const normalized = normalizeText(message);

  if (['si', 'sí', 's', 'ok', 'dale'].includes(normalized)) {
    session.awaitingFinalConfirmation = false;
    this.sessionService.set(userId, session);
    return this.confirmAppointment(userId);
  }

  if (['no', 'n', 'cancelar'].includes(normalized)) {
    this.sessionService.clear(userId);
    return 'Turno cancelado. Si querés, puedo ayudarte a buscar otro horario o médico.';
  }

  return 'Respondé con "sí" o "no", por favor.';
}


}
