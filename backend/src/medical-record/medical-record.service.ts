import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UserService } from '../user/user.service';
import { DoctorService } from '../doctor/doctor.service';
import { MedicalRecordRepository } from './medical-record.repository';
import { MedicalRecord } from './entities/medical-record.entity';
import { ResponseMedicalHistoryDto } from './dto/medical-history.response.dto';
import { ResponseMedicalRecordsDto } from './dto/medical-records-response.dto';

@Injectable()
export class MedicalRecordService {
  constructor(
    private readonly medicalRecordRepository: MedicalRecordRepository,
    private readonly userService: UserService,
    private readonly doctorService: DoctorService
  ) { }

  async createMedicalRecord(dto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const patient = await this.userService.findById(dto.patient_id);

    if (patient.role !== 'patient') {
      throw new BadRequestException('The user does not correspond to a patient');
    }

    const doctor = await this.doctorService.findyById(dto.doctor_id);

    return this.medicalRecordRepository.createMedicalRecord(
      dto,
      patient,
      doctor
    );
  }


  async findMedicalHistory(patientId: string): Promise<ResponseMedicalHistoryDto[]> {
    const patientFound = await this.userService.findById(patientId)
    if (patientFound.role !== 'patient') throw new BadRequestException('ID does not correspond to a patient.')

    const medicalHistory = await this.medicalRecordRepository.findMedicalHistory(patientId)
    if (!medicalHistory) throw new NotFoundException(`Patient ${patientFound.first_name} ${patientFound.last_name} has no medical history`)

    return medicalHistory.map((history) => ({
      patient_id: history.patient.id,
      doctor_id: history.doctor.id,
      reason: history.reason,
      diagnosis: history.diagnosis,
      treatment: history.treatment,
      notes: history.notes,
      created_at: history.created_at,
      doctorName: `${history.doctor.user.first_name} ${history.doctor.user.last_name}`,
      speciality: history.doctor.speciality.name,
    }));
  }


  async findMedicalRecords(doctorId: string) :Promise<ResponseMedicalRecordsDto[]>{
    const foundDoctor = await this.doctorService.findyById(doctorId)

    const listMedicalRecords = await this.medicalRecordRepository.findMedicalRecords(doctorId)
    if (listMedicalRecords.length === 0) throw new NotFoundException(`No medical records were found for the doctor ${foundDoctor.user.first_name} ${foundDoctor.user.last_name}`)

    return listMedicalRecords.map((records) => ({
      patient_id: records.patient.id,
      doctor_id: records.doctor.id,
      reason: records.reason,
      diagnosis: records.diagnosis,
      treatment: records.treatment,
      notes: records.notes,
      created_at: records.created_at,
      patientName: `${records.patient.first_name} ${records.patient.last_name}`,
      speciality: records.doctor.speciality.name,
    }));
  }

  async findById(id: string) :Promise<MedicalRecord>{
    const medicalRecordFound = await this.medicalRecordRepository.findById(id)
    if (!medicalRecordFound) throw new NotFoundException('Not Found Medical Record')
    return medicalRecordFound
  }
}
