import {Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity({ name: 'secretary' })
export class Secretary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.secretary)
    @JoinColumn()
    user: User;

}