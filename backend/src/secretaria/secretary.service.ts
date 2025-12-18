import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import * as bcrypt from 'bcrypt';
import { User } from "../user/entities/user.entity";
import { SecretaryRepository } from "./secretary.repository";
import { UpdateUserDto } from "../user/dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { RolesEnum } from "../user/enums/roles.enum";
import { UserResponse } from "../user/dto/user-response.dto";


@Injectable()
export class SecretaryService {
  constructor(
    private readonly secretaryRepository: SecretaryRepository,
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async findAll(filters: {
    role?: RolesEnum;
    is_active?: boolean;
  }) {
    const where: FindOptionsWhere<User> = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    return this.userRepository.find({ where });
  }


  async findOne(id: string): Promise<UserResponse> {
    const userFound = await this.userRepository.findOneBy({ id })
    if (!userFound) {
      throw new NotFoundException('ID not found')
    }
    return userFound
  }


  async update(id: string, updateUserDto: any) {
    return await this.userService.update(id, updateUserDto);
  }

  async disable(id: string) {
    return await this.userService.disable(id)
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