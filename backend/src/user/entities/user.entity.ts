import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RolesEnum } from "../enums/roles.enum";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50, nullable: false, type: 'varchar', unique: true })
    email: string;

    @Column({ nullable: false, type: 'varchar' })
    password: string;

    @Column({ type: 'enum', enum: RolesEnum, default: RolesEnum.User })
    role: RolesEnum

    @Column({type:'boolean', default: true})
    is_active: boolean;
}
