import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserRepository } from '../user/user.repository';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ){}

  async register({confirmPassword, password, ...user}: {confirmPassword: string, password: string} & Pick<User, 'email' | 'first_name' | 'last_name' | 'dni'>) {
    
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


  async login(credentials: Pick<User, 'email' | 'password'>) {
    const {password, email} = credentials
    const user = await this.userRepository.findByEmail(email)
    if(!user){
      throw new UnauthorizedException('Invalid credentials!')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if(!passwordMatch){
      throw new UnauthorizedException('Invalid credentials!')
    }

    const Payload = {
      sub: user.id,           
      email: user.email,
      role: user.role, 
    }

    const Token = this.jwtService.sign(Payload)
    return{
      success: 'User successfully logged in',
      Token,
    }
  }
  
}
