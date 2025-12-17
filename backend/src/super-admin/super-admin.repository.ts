import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { RolesEnum } from '../user/enums/roles.enum';


@Injectable()
export class SuperAdminRepository {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

  async findAll(role?: RolesEnum, isActive?: boolean) {
    const usersFound = await this.userRepository.find({ where: { role, is_active: isActive } })
    return usersFound;
  }

  async update(user: User) {
    return await this.userRepository.save(user)
  }
  
  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id })
    return user;
  }
}