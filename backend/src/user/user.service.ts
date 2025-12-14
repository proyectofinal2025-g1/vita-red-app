import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) { }

  async create(user: Pick<User, 'email' | 'password' | 'first_name' | 'last_name' | 'dni'>) {
    const userExist = await this.userRepository.findByEmail(user.email)
    if (userExist) throw new BadRequestException('The email is already in use.')
    return await this.userRepository.create(user)
  }

  async findAll() {
    return await this.userRepository.findAll()
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id)
    if (!user) throw new NotFoundException('User not Found')
    return user;
  }

  async update(id: string, user: Partial<User>) {
    if (!user || Object.keys(user).length === 0) throw new BadRequestException('You cannot pass an empty object');
    const userFound = await this.userRepository.findById(id);
    if (!userFound) throw new NotFoundException('User not found')

    return await this.userRepository.update(id, user)
  }

  async disable(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User Not found');
    user.is_active = false;
    return await this.userRepository.disable(user)
  }

  async updatePassword(id: string, dto: { currentPassword: string, newPassword: string }) {
    const user = await this.userRepository.findById(id)
    if (!user) throw new NotFoundException('User not Found')

    const valid = await bcrypt.compare(dto.currentPassword, user.password)
    if (!valid) throw new UnauthorizedException('Invalid password')

    user.password = await bcrypt.hash(dto.newPassword, 10)
    await this.userRepository.updatePassword(user)

    return {message: 'Password successfully updated'}
  }
}
