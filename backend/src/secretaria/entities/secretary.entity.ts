import { User } from "src/user/entities/user.entity";
import {Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'secretary' })
export class Secretary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.secretary)
    @JoinColumn()
    user: User;

}