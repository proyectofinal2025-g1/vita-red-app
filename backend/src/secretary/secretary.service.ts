import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { DoctorService } from '../doctor/doctor.service';
import * as bcrypt from 'bcrypt';
import { User } from "../user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { RolesEnum } from "../user/enums/roles.enum";
import { UserResponse } from "../user/dto/user-response.dto";
import { CreateDoctorDto } from "../doctor/dto/create-doctor.dto";
import { Doctor } from "../doctor/entities/doctor.entity";
import { DoctorFindResponseDto } from "../doctor/dto/doctor-find-response.dto";
import { SpecialityService } from "../speciality/speciality.service";
import { DoctorResponseDto } from "../doctor/dto/doctor-response.dto";
import { CreateAppointmentPreReserveDto } from "../appointments/dto/create-appointment-pre-reserve.dto";
import { AppointmentsService } from "../appointments/appointments.service";
import { PatientAppointmentListResponseDto } from "../appointments/dto/patient-appointment-list-response.dto";
import { DoctorAppointmentListResponseDto } from "../appointments/dto/doctor-appointment-list.dto";
import { DoctorScheduleService } from "../doctor/schedule/schedule.service";
import { UpdateDoctorScheduleDtoBySecretary } from "./dto/scheduleDoctor.dto";
import { CreateDoctorScheduleDto } from "../doctor/schedule/dto/create-doctor-schedule.dto";
import { mapDayToNumber } from "../doctor/schedule/helper/mapDayOfWeek.helper";
import { CreateUser_DoctorDto } from "../doctor/dto/createUser-doctor.dto";


@Injectable()
export class SecretaryService {
  constructor(
    private readonly userService: UserService,
    private readonly doctorService: DoctorService,
    private readonly specialityService: SpecialityService,
    private readonly appointmentsService: AppointmentsService,
    private readonly doctorScheduleService: DoctorScheduleService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>
  ) { }

  /* TODOS LOS USUARIOS */

  async findAll(filters: {
    role?: RolesEnum;
    is_active?: boolean;
  }): Promise<UserResponse[]> {
    const where: FindOptionsWhere<User> = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    const listUser = await this.userRepository.find({ where });
    return listUser.map(({ password, ...user }) => user)
  }


  async findOne(id: string): Promise<UserResponse> {
    const userFound = await this.userRepository.findOneBy({ id })
    if (!userFound) {
      throw new NotFoundException('ID not found')
    }
    const { password, ...userWithoutPassword } = userFound
    return userWithoutPassword
  }

  /* PATIENTS  */

  async getPatientByName(first_name?: string, last_name?: string): Promise<UserResponse[]> {
    const listUser = await this.userService.findByName(first_name, last_name)
    return listUser.filter(user => user.role === RolesEnum.User)
  }

  async getPatientByDni(dni: string): Promise<UserResponse> {
    const userFound = await this.userService.findByDni(dni)
    if (userFound.role !== 'patient') throw new BadRequestException('User is not patient')
    return userFound
  }

  async createPatient({ confirmPassword, password, ...user }: { confirmPassword: string, password: string } & Pick<User, 'email' | 'first_name' | 'last_name' | 'dni'>) {

    if (password !== confirmPassword) {
      throw new BadRequestException('The passwords do not match')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    if (!hashedPassword) {
      throw new InternalServerErrorException(
        'Error generating password hash',
      );
    }

    await this.userService.create({ ...user, password: hashedPassword, });

    return {
      success: 'User successfully registered',
      user,
    };
  }

  async updatePatient(id: string, updateUserDto: Partial<User>) {
    return await this.userService.update(id, updateUserDto);
  }

  async disablePatient(id: string) {
    return await this.userService.disable(id)
  }



  /*  DOCTOR   */

  async createDoctor(createDoctor: CreateUser_DoctorDto) {
    return await this.doctorService.createDoctorWithUser(createDoctor)
  }

  async getDoctors(name?: string): Promise<DoctorFindResponseDto[]> {
    if (name) {
      const foundDoctor = await this.doctorService.findByDoctorName(name)
      if (!foundDoctor) throw new NotFoundException('Not found doctor')
      return foundDoctor
    }
    return await this.doctorService.findAll()
  }


  async getDoctorById(doctorId: string) {
    return await this.doctorService.findyById(doctorId)
  }


  async createScheduleDoctor(
    dto: CreateDoctorScheduleDto,
    userId: string,
    role: RolesEnum,
  ) {
    return this.doctorScheduleService.create(dto, userId, role);
  }



  async updateScheduleDoctor(
    doctorId: string,
    dto: UpdateDoctorScheduleDtoBySecretary,
  ) {
    return this.doctorScheduleService.updateScheduleDoctor(
      doctorId,
      dto,
      RolesEnum.SuperAdmin,
    );
  }



  async findSchedulesByDoctor(doctorId: string, userId: string, userRole: RolesEnum) {
    return this.doctorScheduleService.findByDoctor(
      doctorId,
      userId,
      userRole,
    );
  }

  async getBySpeciality(specialityName?: string): Promise<DoctorFindResponseDto[]> {
    const doctors = await this.doctorRepository.find({
      where:
      {
        speciality:
          { name: ILike(`%${specialityName}%`) }
      },
      relations: {
        speciality: true,
        user: true
      }
    })
    return doctors.map((doctor) => ({
      id: doctor.id,
      fullName: `${doctor.user.first_name} ${doctor.user.last_name}`,
      speciality: doctor.speciality.name,
      licence_number: doctor.licence_number,
    }));
  }

  async disableDoctor(id: string) {
    const foundDoctor = await this.doctorService.remove(id)
    if (!foundDoctor) throw new NotFoundException('Not Found Doctor')
  }


  /*    SPECIALITYS      */
  async getSpecialitys(nameSpeciality?: string) {
    if (nameSpeciality) { return await this.specialityService.findByNameWithDoctors(nameSpeciality) }
    return await this.specialityService.findAll()
  }

  /*   APPOINTMENTS     */
  async preReserveAppointment(dto: CreateAppointmentPreReserveDto, userId: string) {
    return await this.appointmentsService.preReserveAppointment(dto, userId)
  }

  async findAppointmentsByPatientId(
    patientId: string,
    date?: string,
    speciality?: string,
  ): Promise<PatientAppointmentListResponseDto[]> {
    await this.userService.findById(patientId);

    const appointments = await this.appointmentsService.findByFiltersPatient({
      patientId,
      date,
      speciality,
    });


    if (!appointments.length) {
      if (date && speciality) {
        throw new NotFoundException(
          `No appointments were found for the selected speciality on ${date}.`,
        );
      }

      if (date) {
        throw new NotFoundException(
          `No appointments were found on ${date}.`,
        );
      }

      if (speciality) {
        throw new NotFoundException(
          `No appointments were found for the selected speciality.`,
        );
      }

      throw new NotFoundException(
        'No appointments were found for this patient.',
      );
    }

    return appointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.date.toISOString().substring(0, 10),
      time: appointment.date.toISOString().substring(11, 16),
      doctorName: `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`,
      speciality: appointment.speciality.name,
      status: appointment.status,
    }));
  }


  async findAgendByDoctor(
    doctorId: string,
  ): Promise<DoctorAppointmentListResponseDto[]> {
    const doctorFound = await this.doctorService.findyById(doctorId)
    if (!doctorFound) {
      throw new NotFoundException('Doctor not found');
    }
    const appointments = await this.appointmentsService.findAppointmentsByMedic(doctorId)
    return appointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.date.toISOString().substring(0, 10),
      time: appointment.date.toISOString().substring(11, 16),
      patientName: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
      status: appointment.status,
    }));
  }


  async getAppointmentById(id: string) {
    return await this.appointmentsService.findById(id)
  }
}