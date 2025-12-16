import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import * as bcrypt from 'bcrypt';
import { User } from "../user/entities/user.entity";
import { SecretaryRepository } from "./secretary.repository";
import { UpdateUserDto } from "../user/dto/update-user.dto";
import { NotFoundError } from "rxjs";


@Injectable()
export class SecretaryService {
  constructor(
    private readonly secretaryRepository: SecretaryRepository,
    private readonly userService: UserService
  ) { }

  async findAll() {
    return await this.secretaryRepository.findAll();
  }

  async findOne(id: string) {
    const secretaryFound = await this.secretaryRepository.findOne(id);
    if(!secretaryFound){throw new NotFoundException('ID inexisting')}
    return secretaryFound
  }

  async update(id: string, updateUserDto: any) {
    return await this.userService.update(id, updateUserDto);
  }

  async remove(id: string) {
    const secretaryFound = await this.secretaryRepository.remove(id);
    if(!secretaryFound){throw new NotFoundException('ID inexisting')}
    return secretaryFound
  }

  async createPatient({ confirmPassword, password, ...user }: { confirmPassword: string, password: string } & Pick<User, 'email' | 'first_name' | 'last_name' | 'dni'>) {

    if (password !== confirmPassword) {
      throw new BadRequestException('The passwords do not match')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    if (!hashedPassword) {
      throw new InternalServerErrorException(
        'Error generating password hash',
      );
    }

    await this.userService.create({ ...user, password: hashedPassword, });

    return {
      success: 'User successfully registered',
      user,
    };
  }

  async updatePatient(id: string, updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto)
  }

  async deletePatient(id: string) {
    return await this.userService.disable(id)
  }
}