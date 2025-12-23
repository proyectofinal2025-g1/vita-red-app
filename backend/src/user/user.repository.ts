import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class UserRepository {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

    async findByEmail(email: string) {
        const userFound = await this.userRepository.findOneBy({ email })
        return userFound
    }


    async create(createUser: Pick<User, 'email' | 'password' | 'first_name' | 'last_name' | 'dni'>) {
        const userCreate = await this.userRepository.create(createUser)
        const userSave = await this.userRepository.save(userCreate)
        return userSave.id
    }

    async findAll() {
        return await this.userRepository.find()
    }

    async findById(id: string) {
        return await this.userRepository.findOneBy({ id })
    }

    async findByName(first_name?: string, last_name?: string) {
        const where: any = {};

        if (first_name) {
            where.first_name = ILike(`%${first_name}%`);
        }

        if (last_name) {
            where.last_name = ILike(`%${last_name}%`);
        }

        return this.userRepository.find({ where });
    }

    async findByDni(dni: string) {
        return await this.userRepository.findOneBy({ dni })
    }


    async update(id: string, updateUser: Partial<User>) {
        await this.userRepository.update(id, updateUser)
        return `The user with id: ${id} was successfully updated`
    }

    async disable(user: User) {
        await this.userRepository.save(user);
    }

    async updatePassword(user: any) {
        return await this.userRepository.save(user)
    }
}