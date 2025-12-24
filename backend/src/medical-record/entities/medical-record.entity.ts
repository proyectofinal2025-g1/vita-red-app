import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from  '../../user/entities/user.entity'
import { Doctor } from '../../doctor/entities/doctor.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.medical_records)
  patient: User

  @ManyToOne(() => Doctor, (doctor) => doctor.medical_records)
  doctor: Doctor;

  @Column({ type: 'varchar', nullable: false })
  reason: string;

  @Column({ type: 'text', nullable: false})
  diagnosis: string; 

  @Column({ type: 'text', nullable: false})
  treatment: string; 

  @Column({ type: 'text', nullable: true , default: 'No se agregaron notas adicionales'})
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}