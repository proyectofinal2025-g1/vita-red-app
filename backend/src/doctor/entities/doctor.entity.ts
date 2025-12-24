import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Speciality } from "../../speciality/entities/speciality.entity";
import { MedicalRecord } from "../../medical-record/entities/medical-record.entity";

@Entity({ name: 'doctor'})
export class Doctor {

  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ApiProperty()
  @Column({type: 'varchar', length: 50, unique: true, nullable: false})
  licence_number: string
  
  @ApiProperty()
  @OneToOne(() => User, (user) => user.doctor, {nullable: true})
  @JoinColumn({name: 'user_id'})
  user: User;

  @ApiProperty()
  @ManyToOne(() => Speciality, (speciality) => speciality.doctor, {nullable:true})
  @JoinColumn({name:'speciality_id'})
  speciality: Speciality

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty()
  @OneToMany(()=> MedicalRecord, (medical_record)=> medical_record.doctor)
  medical_records: MedicalRecord[]
}
