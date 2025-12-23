import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { DoctorService } from '../doctor/doctor.service';
import * as bcrypt from 'bcrypt';
import { User } from "../user/entities/user.entity";
import { SecretaryRepository } from "./secretary.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { RolesEnum } from "../user/enums/roles.enum";
import { UserResponse } from "../user/dto/user-response.dto";
import { CreateDoctorDto } from "../doctor/dto/create-doctor.dto";
import { Speciality } from "../speciality/entities/speciality.entity";
import { Doctor } from "../doctor/entities/doctor.entity";
import { DoctorFindResponseDto } from "../doctor/dto/doctor-find-response.dto";
import { SpecialityService } from "../speciality/speciality.service";


@Injectable()
export class SecretaryService {
  constructor(
    private readonly secretaryRepository: SecretaryRepository,
    private readonly userService: UserService,
    private readonly doctorService: DoctorService,
    private readonly specialityService: SpecialityService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>
  ) { }

             /* TODOS LOS USUARIOS */

  async findAll(filters: {
    role?: RolesEnum;
    is_active?: boolean;
  }) :Promise<UserResponse[]> {
    const where: FindOptionsWhere<User> = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    const listUser = await this.userRepository.find({ where });
    return listUser.map(({password, ...user})=> user)
  }


  async findOne(id: string): Promise<UserResponse> {
    const userFound = await this.userRepository.findOneBy({ id })
    if (!userFound) {
      throw new NotFoundException('ID not found')
    }
    const {password, ...userWithoutPassword} = userFound
    return userWithoutPassword
  }

        /* PATIENTS  */

  async getPatientByName(first_name?: string, last_name?: string){
    const listUser = await this.userService.findByName(first_name, last_name)
    return listUser.filter(user => user.role === RolesEnum.User)
  }

    async getPatientByDni(dni: string) :Promise<UserResponse>{
    const userFound = await this.userService.findByDni(dni)
    if(userFound.role !== 'patient') throw new BadRequestException('User is not patient')
      return userFound
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

  async updatePatient(id: string, updateUserDto: Partial<User>) {
    return await this.userService.update(id, updateUserDto);
  }

  async disablePatient(id: string) {
    return await this.userService.disable(id)
  }



          /*  DOCTOR   */

  async createDoctor(createDoctor: CreateDoctorDto){
    return await this.doctorService.create(createDoctor)
  }

async getDoctors(name?: string) {
  if(name){
    const foundDoctor = await this.doctorService.findByDoctorName(name)
    if(!foundDoctor) throw new NotFoundException('Not found doctor')
      return foundDoctor
  }
  return await this.doctorService.findAll()
}

async getBySpeciality(specialityName?: string) :Promise<DoctorFindResponseDto[]>{
  const doctors = await this.doctorRepository.find({where: 
    {speciality: 
      {name: ILike(`%${specialityName}%`)}
    },
    relations: {
      speciality: true,
      user: true
    }
  })
   return doctors.map((doctor) => ({
    id: doctor.id,
    fullName: `${doctor.user.first_name} ${doctor.user.last_name}`,
    speciality: doctor.speciality.name,
    licence_number: doctor.licence_number,
  }));
}

async disableDoctor(id: string){
  const foundDoctor = await this.doctorService.remove(id)
  if(!foundDoctor) throw new NotFoundException('Not Found Doctor')
}


    /* SPECIALITYS  */
async getSpecialitys (nameSpeciality?: string){
  if (nameSpeciality){ return await this.specialityService.findByNameWithDoctors(nameSpeciality)}
  return await this.specialityService.findAll()
}
}