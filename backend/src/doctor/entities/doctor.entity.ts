import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Speciality } from "../../speciality/entities/speciality.entity";
import { MedicalRecord } from "../../medical-record/entities/medical-record.entity";


@Entity({ name: 'doctor' }) 
export class Doctor {
  
  @ApiProperty({
    description: 'ID único del perfil médico',
    example: 'c7e2d5c3-9c4a-4b5e-9a77-1c8b3f1a9f21',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Número de matrícula profesional del médico',
    example: 'MP-12345',
  })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  licence_number: string;

  @ApiProperty({
    description: 'Usuario asociado al perfil médico',
    type: () => User,
  })
  @OneToOne(() => User, (user) => user.doctor, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'Especialidad principal del médico',
    type: () => Speciality,
    required: false,
  })
  @ManyToOne(() => Speciality, (speciality) => speciality.doctor, {
    nullable: false,
  })
  @JoinColumn({ name: 'speciality_id' })
  speciality: Speciality;

  @ApiProperty({
    description: 'Descripción profesional del médico',
    example: 'Cardiólogo con más de 10 años de experiencia en clínicas privadas.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @ApiProperty({
    description: 'Años de experiencia profesional',
    example: 10,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  yearsOfExperience?: number;

  @ApiProperty({
    description: 'Costo base de la consulta médica',
    example: 20000,
    required: false,
  })
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 20000
  })
  consultationPrice?: number;

  @ApiProperty({
    description: 'Indica si el perfil médico está activo',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty()
  @OneToMany(()=> MedicalRecord, (medical_record)=> medical_record.doctor)
  medical_records: MedicalRecord[]
}
