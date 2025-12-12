import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RolesEnum } from "../enums/roles.enum";
import { Secretary } from "src/secretaria/entities/secretary.entity";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', nullable: false, length: 30})
    first_name: string;

    @Column({type: 'varchar', nullable: false, length: 30})
    last_name: string;

    @Column({type: 'varchar', nullable: false, unique: true, length: 15})
    dni: string;

    @Column({ length: 50, nullable: false, type: 'varchar', unique: true })
    email: string;

    @Column({ nullable: false, type: 'varchar' })
    password: string;

    @Column({ type: 'enum', enum: RolesEnum, default: RolesEnum.User })
    role: RolesEnum

    @Column({type:'boolean', default: true})
    is_active: boolean;

    /*@OneToOne(() => Doctor, (doctor) => doctor.user, { nullable: true })
    doctor?: Doctor; */

    /*@OneToOne(() => Patient, (patient) => patient.user, { nullable: true })
    patient?: Patient;*/

    @OneToOne(() => Secretary, (secretary) => secretary.user, { nullable: true })
    secretary?: Secretary;

    /*@OneToOne(() => Admin, (admin) => admin.user, { nullable: true })
    admin?: Admin;*/
}
