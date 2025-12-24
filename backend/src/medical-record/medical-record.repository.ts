import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MedicalRecord } from "./entities/medical-record.entity";
import { CreateMedicalRecordDto } from "./dto/create-medical-record.dto";
import { User } from "../user/entities/user.entity";
import { Doctor } from "../doctor/entities/doctor.entity";

@Injectable()
export class MedicalRecordRepository {
    constructor(
        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>
    ) { }

    async createMedicalRecord(
        dto: CreateMedicalRecordDto,
        patient: User,
        doctor: Doctor
    ) {
        const medicalRecord = this.medicalRecordRepository.create({
            reason: dto.reason,
            diagnosis: dto.diagnosis,
            treatment: dto.treatment,
            notes: dto.notes,
            patient,
            doctor,
        });

        return await this.medicalRecordRepository.save(medicalRecord);
    }


    async findMedicalHistory(patient_id: string) {
        return await this.medicalRecordRepository.find({
            where: { patient: { id: patient_id } },
            relations: {
                doctor: {
                    user: true,
                    speciality: true,
                },
                patient: true,
            },
        })
    }

    async findMedicalRecords(doctor_id: string) {
        return await this.medicalRecordRepository.find({
            where: { doctor: { id: doctor_id } },
            relations:{
                doctor: {
                    user: true,
                    speciality: true,
                },
                patient: true,
            },
        })
    }

    async findById(id: string) {
        return await this.medicalRecordRepository.findOneBy({ id })
    }

}

