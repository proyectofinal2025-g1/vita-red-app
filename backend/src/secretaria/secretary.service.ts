import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import * as bcrypt from 'bcrypt';
import { User } from "../user/entities/user.entity";


@Injectable()
export class SecretaryService {
    constructor(
        private readonly secretaryRepository: SecretaryService,
        private readonly userService: UserService
    ){}

    async findAll() {
        return await this.secretaryRepository.findAll();
    }

    async findOne(id: string) {
        return await this.secretaryRepository.findOne(id);
    }

    async update(id: string, updateUserDto: any) {
        return await this.userService.update(id, updateUserDto);
    }

    async remove(id: string) {
        return await this.secretaryRepository.remove(id);
    }

    async createPatient({confirmPassword, password, ...user}: {confirmPassword: string, password: string} & Pick<User, 'email' | 'first_name' | 'last_name' | 'dni'>) {
        
        if(password !== confirmPassword){
          throw new BadRequestException('The passwords do not match')
        }
    
        const hashedPassword = await bcrypt.hash(password, 10)
        if(!hashedPassword){
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
}