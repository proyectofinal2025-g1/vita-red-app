import { Injectable } from "@nestjs/common";
import { ChatIntent } from "./enum/chat.enum";
import { ChatIAService } from "./chatIA/chatIA.service";
import { ChatSessionService } from "./chatIA/chatIA-memory.service";
import { SpecialityService } from "../speciality/speciality.service";
import { DoctorService } from "../doctor/doctor.service";
import { AppointmentsService } from "../appointments/appointments.service";
import { PaymentsService } from "../payments/payments.service";
import { normalizeText } from "./helpers/text.helper";
import { isGeneral, isStrongPassword, resolveSpecialityName } from "./helpers/specialitiesWithoutAccent.helper";
import { UserService } from "../user/user.service";
import * as bcrypt from 'bcrypt';
import { UserRepository } from "../user/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { DoctorScheduleService } from "../doctor/schedule/schedule.service";
import { months } from "./enum/months.enum";


@Injectable()
export class ChatService {
  constructor(
    private readonly chatIA: ChatIAService,
    private readonly sessionService: ChatSessionService,
    private readonly specialityService: SpecialityService,
    private readonly doctorService: DoctorService,
    private readonly doctorScheduleService: DoctorScheduleService,
    private readonly appointmentsService: AppointmentsService,
    private readonly paymentsService: PaymentsService,
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async chatMessage(
    userId: string,
    message: string,
    authUser?: { id: string })
    : Promise<string> {

    const session = this.sessionService.get(userId);


  if (authUser && !session.userAuthenticated) {
    session.realUserId = authUser.id;
    session.userAuthenticated = true;
      this.sessionService.set(userId, session);
    }

    console.log('CHAT MESSAGE', {
      chatUserId: userId,
      message,
      realUserId: session.realUserId,
      userAuthenticated: session.userAuthenticated,
    });

    const normalized = normalizeText(message);

    const looksLikeNumber = /^\d+$/.test(normalized);
    const looksLikeNewIntent =
      normalized.includes('medic') ||
      normalized.includes('especial') ||
      normalized.includes('pediatr') ||
      normalized.includes('clinic') ||
      normalized.includes('cardio');

    if (session.awaitingRegisterEmail) {
      return this.handleRegisterEmail(userId, message);
    }

    if (session.awaitingRegisterPassword) {
      return this.handleRegisterPassword(userId, message);
    }

    if (session.awaitingRegisterConfirmPassword) {
      return this.handleRegisterConfirmPassword(userId, message);
    }

    if (session.awaitingRegisterFirstName) {
      return this.handleRegisterFirstName(userId, message);
    }

    if (session.awaitingRegisterLastName) {
      return this.handleRegisterLastName(userId, message);
    }

    if (session.awaitingRegisterDni) {
      return this.handleCreateUser(userId, message);
    }

    if (
      session.lastDoctorsList &&
      session.lastDoctorsList.length > 0 &&
      !looksLikeNumber &&
      looksLikeNewIntent
    ) {
      console.log('⚠️ CLEAR POR NUEVO INTENT', {
        message,
        realUserIdAntes: session.realUserId,
      });

      this.sessionService.clear(userId);
    }

    if (session.awaitingReserveConfirmation) {
      return this.handleReserveConfirmation(userId, message);
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

    if (session.awaitingRecommendConfirmation) {
      return this.handleRecommendConfirmation(userId, message);
    }

    if (session.awaitingUserIdentification) {
      return this.handleIdentifyUser(userId, message);
    }

    if (session.awaitingUpdateField) {
      return this.handleUpdateFieldSelection(userId, message);
    }

    if (session.awaitingUpdateValue) {
      return this.handleUpdateValue(userId, message);
    }

    const ai = await this.chatIA.detectIntent(message);
    session.lastIntent = ai.intent;

    switch (ai.intent) {
      case ChatIntent.GREETING:
        if (
          normalized.includes('turno') ||
          normalized.includes('sacar') ||
          normalized.includes('reserv')
        ) {
          return this.handleRecommendSpeciality(userId, { symptoms: [] });
        }
        return 'Hola, ¿en qué puedo ayudarte?';

      case ChatIntent.REGISTER:
        session.awaitingRegisterEmail = true;
        this.sessionService.set(userId, session);
        return 'Perfecto. Empecemos con el registro. Ingresá tu email por favor.';

      case ChatIntent.RECOMMEND_SPECIALITY:
        return this.handleRecommendSpeciality(userId, ai.payload);

      case ChatIntent.LIST_DOCTORS:
        return this.handleListDoctors(userId, ai.payload);

      case ChatIntent.LIST_AVAILABLE_SLOTS:
        return this.handleListAvailableSlots(userId);

      case ChatIntent.BOOK_APPOINTMENT:
        return this.handleBookAppointment(userId, ai.payload);

      case ChatIntent.LIST_USER_APPOINTMENTS:
        return this.handleListUserAppointments(userId);

      case ChatIntent.UPDATE:
        return this.handleUpdateStart(userId);

      default:
        return 'No terminé de entenderte. ¿Podés reformular?';
    }
  }

  private async handleRegisterEmail(userId: string, message: string): Promise<string> {
    const session = this.sessionService.get(userId);
    const email = message.trim().toLowerCase();

    if (!email.includes('@')) {
      return 'Ese email no parece válido. ¿Podés escribirlo de nuevo?';
    }

    const existingEmail = await this.userService.findByEmail(email)
    if (existingEmail) {
      return 'Ese email ya está registrado. ¿Querés intentar con otro?';
    }

    session.registerEmail = message;
    session.awaitingRegisterEmail = false;
    session.awaitingRegisterPassword = true;

    this.sessionService.set(userId, session);
    return 'Perfecto. Ahora ingresá una contraseña.';
  }




  private handleRegisterPassword(
    userId: string,
    message: string
  ): string {
    const session = this.sessionService.get(userId);

    if (!isStrongPassword(message)) {
      return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.';
    }

    session.registerPassword = message;
    session.awaitingRegisterPassword = false;
    session.awaitingRegisterConfirmPassword = true;

    this.sessionService.set(userId, session);

    return 'Confirmá la contraseña.';
  }





  private handleRegisterConfirmPassword(userId: string, message: string): string {
    const session = this.sessionService.get(userId);

    if (message !== session.registerPassword) {
      return 'Las contraseñas no coinciden. Intentá nuevamente.';
    }

    session.awaitingRegisterConfirmPassword = false;
    session.awaitingRegisterFirstName = true;

    this.sessionService.set(userId, session);

    return 'Bien. ¿Cuál es tu nombre?';
  }




  private handleRegisterFirstName(userId: string, message: string): string {
    const session = this.sessionService.get(userId);

    session.registerFirstName = message;
    session.awaitingRegisterFirstName = false;
    session.awaitingRegisterLastName = true;

    this.sessionService.set(userId, session);
    return '¿Cuál es tu apellido?';
  }




  private handleRegisterLastName(userId: string, message: string): string {
    const session = this.sessionService.get(userId);

    session.registerLastName = message;
    session.awaitingRegisterLastName = false;
    session.awaitingRegisterDni = true;

    this.sessionService.set(userId, session);
    return 'Por último, ingresá tu DNI.';
  }



  private async handleCreateUser(userId: string, message: string): Promise<string> {
    const session = this.sessionService.get(userId);
    const dni = message.trim();


    let dniExisting
    try {
      dniExisting = await this.userService.findByDni(dni);
    } catch (error) {
      dniExisting = null;
    }

    if (dniExisting) {
      return `El DNI ${dni} ya existe. ¿Seguro que es tuyo? Ingresalo nuevamente.`;
    }

    session.registerDni = dni;

    if (
      !session.registerEmail ||
      !session.registerPassword ||
      !session.registerFirstName ||
      !session.registerLastName ||
      !session.registerDni
    ) {
      throw new Error('Estado de registro inconsistente');
    }

    const passwordHash = await bcrypt.hash(session.registerPassword, 10);

    const user = await this.userService.create({
      email: session.registerEmail,
      password: passwordHash,
      first_name: session.registerFirstName,
      last_name: session.registerLastName,
      dni: session.registerDni,
    });

    delete session.awaitingRegisterEmail;
    delete session.awaitingRegisterPassword;
    delete session.awaitingRegisterConfirmPassword;
    delete session.awaitingRegisterFirstName;
    delete session.awaitingRegisterLastName;
    delete session.awaitingRegisterDni;

    session.userAuthenticated = true;
    session.realUserId = user.id;

    return `Registro exitoso, ${session.registerFirstName}. ¿Cómo te ayudo ahora?`;
  }


  private async handleRecommendSpeciality(userId: string, payload?: any): Promise<string> {
    const session = this.sessionService.get(userId);

    if (session.recommendedSpeciality) {
      session.awaitingRecommendConfirmation = true;
      this.sessionService.set(userId, session);

      return `Perfecto, entonces vemos médicos de ${session.recommendedSpeciality}. ¿Querés que te los muestre?`;
    }

    const symptoms: string[] | undefined = payload?.symptoms;

    if (!symptoms || symptoms.length === 0) {
      return '¿Qué síntomas estás teniendo?';
    }

    session.symptoms = symptoms;

    if (isGeneral(symptoms)) {
      session.recommendedSpeciality = 'clinico';
      session.awaitingRecommendConfirmation = true;

      this.sessionService.set(userId, session);

      return 'Perfecto, para un control te recomiendo Clínica Médica. ¿Querés que te muestre los médicos disponibles?';
    }

    const normalized = normalizeText(payload?.suggestedSpeciality ?? '');
    const resolved = resolveSpecialityName(normalized) ?? 'clinico';

    session.recommendedSpeciality = resolved;
    session.awaitingRecommendConfirmation = true;

    this.sessionService.set(userId, session);

    return `Te recomiendo ${resolved}. ¿Querés que te muestre médicos disponibles?`;
  }


  private async handleRecommendConfirmation(
    userId: string,
    message: string
  ): Promise<string> {
    const session = this.sessionService.get(userId);
    const normalized = normalizeText(message);

    if (['si', 'sí', 's', 'dale', 'ok', 'claro'].includes(normalized)) {
      session.awaitingRecommendConfirmation = false;
      this.sessionService.set(userId, session);

      return await this.handleListDoctors(userId);
    }

    if (['no', 'n', 'cancelar'].includes(normalized)) {
      this.sessionService.clear(userId);
      return 'Está bien. Si querés, puedo ayudarte con otra consulta.';
    }

    return 'Respondé con "sí" o "no", por favor.';
  }




  private async handleListDoctors(
    userId: string,
    payload?: any
  ): Promise<string> {
    const session = this.sessionService.get(userId);
    const rawSpeciality = session.recommendedSpeciality ?? payload?.speciality;

    if (!rawSpeciality) {
      return '¿Qué especialidad estás buscando? Por ejemplo: pediatría, clínica, cardiología.';
    }

    // const normalizedSpeciality = normalizeText(rawSpeciality);
    const dbSpecialityName = resolveSpecialityName(rawSpeciality);
    console.log(dbSpecialityName)

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

      return 'Perfecto. ¿Para qué mes querés el turno? ';
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

    session.awaitingReserveConfirmation = true;
    this.sessionService.set(userId, session);

    return `Turnos disponibles:\n${list}\n¿Querés reservar alguno?`;


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
  
  const input = message.trim().toLowerCase();
  
  let month = parseInt(input, 10);

  if (isNaN(month) || month < 1 || month > 12) {
    const monthKey = input as keyof typeof months;
    if (months[monthKey]) {
      month = months[monthKey];
    }
  }

  if (isNaN(month) || month < 1 || month > 12) {
    return 'Por favor, ingresá un mes válido (ej: "1" o "enero").';
  }

  session.selectedMonth = month;
  session.awaitingMonth = false; 
  session.awaitingDay = true;

  this.sessionService.set(userId, session);

  const monthName = Object.keys(months).find(key => months[key as keyof typeof months] === month);
  
  return `Perfecto. ¿Qué día de ${monthName} querés?`;
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

  if (!session.selectedMonth || !session.doctorId) {
    return 'Faltan datos para seleccionar el día.';
  }

  const year = new Date().getFullYear();
  const monthIndex = session.selectedMonth - 1;

  const selectedDate = new Date(year, monthIndex, day);
  const dayOfWeek = selectedDate.getDay();

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

  if (!session.doctorId || !session.selectedDay || !session.selectedMonth) {
    return 'Faltan datos para calcular los horarios disponibles.';
  }

  const year = new Date().getFullYear();
  const month = String(session.selectedMonth).padStart(2, '0');
  const day = String(session.selectedDay).padStart(2, '0');

  const jsDate = new Date(`${year}-${month}-${day}T00:00:00`);
  const dayOfWeek = jsDate.getDay(); // 0 = domingo, 6 = sábado


  const allSchedules = await this.doctorScheduleService.findByDoctor(
    session.doctorId,
    userId,
    session.userRole 
  );

  const daySchedules = allSchedules.filter(s => s.dayOfWeek === dayOfWeek);

  if (daySchedules.length === 0) {
    return 'El médico no atiende ese día.';
  }

  const allSlots: string[] = [];
  for (const s of daySchedules) {
    let [h, m] = s.startTime.split(':').map(Number);
    const [endH, endM] = s.endTime.split(':').map(Number);

    while (h < endH || (h === endH && m < endM)) {
      allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      m += 30; // duración fija de 30 min, o usar s.slotDuration si quieres
      if (m >= 60) {
        m = 0;
        h++;
      }
    }
  }

  // Quitamos los horarios ya ocupados
  const dateStr = `${year}-${month}-${day}`;
  const { occupiedTimes } = await this.appointmentsService.getAvailability(
    session.doctorId,
    dateStr
  );

  const availableSlots = allSlots.filter(slot => !occupiedTimes.includes(slot));

  if (availableSlots.length === 0) {
    return 'No hay horarios disponibles para ese día.';
  }

  session.availableHours = availableSlots;
  session.awaitingHourSelection = true;
  this.sessionService.set(userId, session);

  // Armamos el texto de la lista
  const list = availableSlots.map((h, i) => `${i + 1}) ${h}`).join('\n');

  return (
    `Horarios disponibles el ${day}/${month}:\n` +
    `${list}\n\n` +
    `Elegí un número para continuar.`
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
      `${day}/${month}/${year}\n` +
      `${selectedHour}\n\n` +
      `¿Querés confirmar el turno?`
    );
  }





 private async confirmAppointment(userId: string): Promise<string> {
  const session = this.sessionService.get(userId);


  if (!session.userAuthenticated || !session.realUserId) {
    session.awaitingRegisterEmail = true;
    this.sessionService.set(userId, session);

    return (
      'Para confirmar el turno necesitás registrarte.\n\n' +
      'Comencemos. Ingresá tu email por favor.'
    );
  }

  const preReserve = await this.appointmentsService.preReserveAppointment(
    {
      doctorId: session.doctorId!,
      specialtyId: session.specialtyId,
      dateTime: session.selectedDateTime!,
      reason: session.reason,
    },
    session.realUserId,
  );

  const payment = await this.paymentsService.createPreference({
    appointmentId: preReserve.appointmentId,
  });

  console.log('payment: ', payment)
  delete session.doctorId;
  delete session.specialtyId;
  delete session.selectedMonth;
  delete session.selectedDay;
  delete session.selectedHour;
  delete session.selectedDateTime;
  delete session.availableHours;
  delete session.awaitingFinalConfirmation;
  delete session.awaitingHourSelection;
  delete session.awaitingDay;
  delete session.awaitingMonth;
  delete session.awaitingSlotsConfirmation;
  delete session.awaitingReserveConfirmation;

  this.sessionService.set(userId, session);

  return (
    `Turno pre-reservado con éxito.\n\n` +
    `Vence el: ${preReserve.expiresAt.toLocaleString('es-AR')}\n` +
    `Precio: $${preReserve.price}\n\n` +
    `Para confirmarlo, completá el pago en el siguiente link:\n` +
    `${payment.initPoint}`
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


  private handleReserveConfirmation(
    userId: string,
    message: string
  ): string {
    const session = this.sessionService.get(userId);
    const normalized = normalizeText(message);

    if (['si', 'sí', 's', 'dale', 'ok'].includes(normalized)) {
      session.awaitingReserveConfirmation = false;
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




  private async handleUpdateStart(userId: string): Promise<string> {
    const session = this.sessionService.get(userId);

    if (!session.realUserId) {
      session.awaitingUserIdentification = true;
      this.sessionService.set(userId, session);
      return 'Para modificar tus datos necesito identificarte. Ingresá tu email o DNI.';
    }

    session.awaitingUpdateField = true;
    this.sessionService.set(userId, session);

    return (
      '¿Qué dato querés actualizar?\n' +
      '1) Nombre\n' +
      '2) Apellido\n' +
      '3) Email\n' +
      '4) Contraseña'
    );
  }




  private async handleUpdateFieldSelection(userId: string, message: string): Promise<string> {
    const session = this.sessionService.get(userId);

    const option = parseInt(message, 10);

    const fieldMap = {
      1: 'first_name',
      2: 'last_name',
      3: 'email',
      4: 'password',
    } as const;

    const selectedField = fieldMap[option];

    if (!selectedField) {
      return 'Elegí una opción válida (1 a 4).';
    }

    session.pendingUpdateField = selectedField;
    session.awaitingUpdateField = false;
    session.awaitingUpdateValue = true;

    this.sessionService.set(userId, session);

    return selectedField === 'password'
      ? 'Ingresá la nueva contraseña.'
      : `Ingresá el nuevo ${selectedField.replace('_', ' ')}.`;
  }



  private async handleUpdateValue(userId: string, message: string): Promise<string> {
    const session = this.sessionService.get(userId);
    const field = session.pendingUpdateField;

    if (!field) {
      this.sessionService.clear(userId);
      return 'Ocurrió un error. Volvamos a empezar.';
    }

    let value = message;

    if (field === 'email' && !message.includes('@')) {
      return 'Ese email no parece válido. Ingresalo nuevamente.';
    }

    if (field === 'password') {
      if (!isStrongPassword(message)) {
        return 'La contraseña no cumple los requisitos de seguridad.';
      }
      value = await bcrypt.hash(message, 10);
    }

    if (!session.realUserId) {
      this.sessionService.clear(userId);
      return 'No pude identificar tu usuario. Volvamos a empezar.';
    }

    console.log('use', {
      realUserId: session.realUserId,
      field,
      value,
    });

    await this.userService.update(session.realUserId!, {
      [field]: value,
    });

    delete session.awaitingUpdateValue;
    delete session.pendingUpdateField;

    this.sessionService.set(userId, session);

    return 'Dato actualizado correctamente. ¿Querés modificar algo más?';
  }



  private async handleIdentifyUser(userId: string, message: string): Promise<string> {
    const session = this.sessionService.get(userId);
    const value = message.trim();

    let user;

    if (value.includes('@')) {
      user = await this.userService.findByEmail(value);
    } else {
      user = await this.userService.findByDni(value);
    }

    if (!user) {
      return 'No encontré un usuario con esos datos. Intentá nuevamente.';
    }

    session.realUserId = user.id;
    session.userAuthenticated = true;
    session.awaitingUserIdentification = false;
    session.awaitingUpdateField = true;

    this.sessionService.set(userId, session);

    return (
      'Perfecto, ya te identifiqué.\n' +
      '¿Qué dato querés actualizar?\n' +
      '1) Nombre\n' +
      '2) Apellido\n' +
      '3) Email\n' +
      '4) Contraseña'
    );
  }


}
