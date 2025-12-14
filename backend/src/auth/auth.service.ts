import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserRepository } from '../user/user.repository';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ){}

  async register(registerDto: CreateUserDto) {
    const user = await this.userRepository.findByEmail(registerDto.email);
    if(user){
      throw new ConflictException('The user already exists')
    }

    if(registerDto.password !== registerDto.confirmPassword){
      throw new BadRequestException('The passwords do not match')
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10)

    if(!hashedPassword){
      throw new InternalServerErrorException(
        'Error generating password hash',
      );
    }

    await this.userRepository.create({ ...registerDto, password: hashedPassword, });

    const {password, confirmPassword, ...userWithoutPass } = registerDto

    return userWithoutPass
  }


  async login(loginDto: LoginUserDto) {
    const {password, email} = loginDto
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
