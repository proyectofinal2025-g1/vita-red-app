import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import seedData from './data/seeder.json';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { DoctorService } from '../doctor/doctor.service';
import { SpecialityService } from '../speciality/speciality.service';
import { RolesEnum } from '../user/enums/roles.enum';
import { Doctor } from '../doctor/entities/doctor.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface Seeder {
  user: {
    first_name: string;
    last_name: string;
    dni: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
  };
  doctor: {
    licence_number: string;
  };
  speciality: string;
}

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly doctorService: DoctorService,
    private readonly specialityService: SpecialityService,
    @InjectRepository(User) private readonly userDb: Repository<User>
  ) { }

  async seedSuperAdmin() {
    const SuperAdmin: Partial<User> = {
      first_name: process.env.FIRST_NAME_SUPERADMIN,
      last_name: process.env.LAST_NAME_SUPERADMIN,
      dni: process.env.DNI_SUPERADMIN,
      email: process.env.EMAIL_SUPERADMIN,
      password: process.env.PASSWORD_SUPERADMIN
    };

    const userFound = await this.userRepository.findByEmail(SuperAdmin.email!)
    if (userFound) {
      this.logger.warn('Ya existe un superAdmin')
    } else {
      if (!process.env.PASSWORD_SUPERADMIN) throw new Error('No existe la password') 
      const passwordHash = await bcrypt.hashSync(process.env.PASSWORD_SUPERADMIN, 10)
      SuperAdmin.role = RolesEnum.SuperAdmin;
      SuperAdmin.password = passwordHash
      await this.userDb.save(SuperAdmin)
      this.logger.log('SuperAdmin creado correctamente')
    }
  }

  async run(): Promise<void> {
    this.logger.log('Iniciando seed de doctores...');

    for (const seed of seedData as Seeder[]) {
      try {
        const speciality = await this.specialityService.chargeSpeciality(
          seed.speciality,
        );

        let user = await this.userRepository.findByEmail(seed.user.email);

        if (!user) {
          const hashedPassword = await bcrypt.hash(seed.user.password, 10);

          const userId = await this.userService.create({
            email: seed.user.email,
            password: hashedPassword,
            first_name: seed.user.first_name,
            last_name: seed.user.last_name,
            dni: seed.user.dni,
          });

          user = await this.userRepository.findById(userId);
        }

        if (!user) {
          throw new Error(
            `User could not be created or found: ${seed.user.email}`,
          );
        }

        if (user.role !== RolesEnum.Medic) {
          await this.userRepository.update(user.id, {
            role: RolesEnum.Medic,
            is_active: true,
          });

          user = await this.userRepository.findById(user.id);
        }

        const validUser = user;

        const doctorExists = await this.dataSource
          .getRepository(Doctor)
          .findOne({
            where: { licence_number: seed.doctor.licence_number },
          });

        if (doctorExists) {
          this.logger.log(
            `Doctor ya existente (seed skip): ${seed.user.first_name} ${seed.user.last_name} | ${seed.speciality} | ${seed.doctor.licence_number}`,
          );
          continue;
        }

        await this.doctorService.create({
          licence_number: seed.doctor.licence_number,
          user_id: user!.id,
          speciality_id: speciality.id,
        });

        this.logger.log(
          `Doctor ${seed.doctor.licence_number} cargado correctamente`,
        );
      } catch (error) {
        this.logger.error(
          `Error al procesar doctor ${seed.doctor.licence_number}: ${error.message}`,
        );
      }
    }

    this.logger.log('Seed de doctores finalizado');
  }
}
