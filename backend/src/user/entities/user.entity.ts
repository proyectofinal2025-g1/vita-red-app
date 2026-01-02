import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RolesEnum } from "../enums/roles.enum";
import { Doctor } from "../../doctor/entities/doctor.entity";
import { MedicalRecord } from "../../medical-record/entities/medical-record.entity";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: true, type: 'varchar'})
    profileImageUrl?: string;

    @Column({nullable: true, type: 'varchar'})
    profileImagePublicId?: string;

    @Column({type: 'varchar', nullable: false, length: 30})
    first_name: string;

    @Column({type: 'varchar', nullable: false, length: 30})
    last_name: string;

    @Column({type: 'varchar', nullable: true, unique: true, length: 15})
    dni: string | null;

    @Column({ length: 50, nullable: false, type: 'varchar', unique: true })
    email: string;

    @Column({ nullable: true, type: 'varchar' })
    password: string | null;

    @Column({ type: 'enum', enum: RolesEnum, default: RolesEnum.User })
    role: RolesEnum

    @OneToMany(()=> MedicalRecord, (medical_record) => medical_record.patient)
    medical_records: MedicalRecord[]

    @Column({type:'boolean', default: true})
    is_active: boolean;

    @OneToOne(() => Doctor, (doctor) => doctor.user, { nullable: true })
    doctor?: Doctor;
}


// admin@vitared.test
// SuperAdmin123!
