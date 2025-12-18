import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { RolesEnum } from '../user/enums/roles.enum';

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

    if(user.is_active === false && user.role !== RolesEnum.SuperAdmin) throw new UnauthorizedException('Invalid credentials!')

    const Payload = {
      first_name: user.first_name,
      last_name: user.last_name,
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
