import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Doctor } from "../../doctor/entities/doctor.entity";

@Entity({ name:'speciality'})
export class Speciality {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true})
  name: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 150, nullable: false})
  description:string

  @ApiProperty()
  @OneToMany(()=> Doctor, (doctor) => doctor.speciality, {nullable: true})
  doctor: Doctor[]
  
  @ApiProperty()
  @Column({type:'boolean', default: true})
  isActive: boolean
}
