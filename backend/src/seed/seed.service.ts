import { Injectable, Logger } from '@nestjs/common';

import seedData from './data/seeder.json';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { DoctorService } from '../doctor/doctor.service';
import { SpecialityService } from '../speciality/speciality.service';
import { RolesEnum } from '../user/enums/roles.enum';
import * as bcrypt from 'bcrypt';

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
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly doctorService: DoctorService,
    private readonly specialityService: SpecialityService,
  ) {}

  async run(): Promise<void> {
    this.logger.log(' Iniciando seed de doctores...');

    for (const seed of seedData as Seeder[]) {
      try {
        const speciality = await this.specialityService.chargeSpeciality(
          seed.speciality,
        );

        let user = await this.userRepository.findByEmail(seed.user.email);

        const hashedPassword = await bcrypt.hash(seed.user.password, 10);
        if (!user) {
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

        if (!user) {
          throw new Error(
            `User not found or not created for email: ${seed.user.email}`,
          );
        }

        await this.doctorService.create({
          licence_number: seed.doctor.licence_number,
          user_id: user.id,
          speciality_id: speciality.id,
        });

        this.logger.log(
          ` Doctor ${seed.doctor.licence_number} cargado correctamente`,
        );
      } catch (error) {
        this.logger.warn(
          ` No se pudo cargar el doctor ${seed.doctor.licence_number}: ${error.message}`,
        );
      }
    }

    this.logger.log('Seed de doctores finalizado');
  }
}
