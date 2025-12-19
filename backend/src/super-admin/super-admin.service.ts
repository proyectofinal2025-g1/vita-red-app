import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SuperAdminRepository } from './super-admin.repository';
import { RolesEnum } from '../user/enums/roles.enum';
import { SpecialityEnum } from './enum/speciality.enum';

@Injectable()
export class SuperAdminService {
  constructor(private readonly super_adminRepository: SuperAdminRepository) { }
  
  async findAll(role?: RolesEnum, isActive?: boolean) {
    return await this.super_adminRepository.findAll(role, isActive)
  }
  
  async findAllDoctors(specialty?: SpecialityEnum) {
    if (specialty && !Object.values(SpecialityEnum).includes(specialty)) {
      throw new BadRequestException('Validation failed (enum string is expected)')
    }
    return await this.super_adminRepository.findAllDoctors(specialty);
  }
  
  async updateActive(id: string) {
    const userFound = await this.super_adminRepository.findOne(id)
    if (!userFound) {
      throw new NotFoundException(`User with id: ${id} not found.`)
    } else if (userFound.role === RolesEnum.SuperAdmin) {
      throw new ForbiddenException('You cannot disable a super admin')
    }
    userFound.is_active = !userFound.is_active
    await this.super_adminRepository.update(userFound)
    return !userFound.is_active ? 'User successfully deactivated' : 'User successfully activated'
  }
  
  async updateRole(id: string, role: RolesEnum) {
    const userFound = await this.super_adminRepository.findOne(id)
    if (!userFound) {
      throw new NotFoundException(`User with id: ${id} not found.`)
    } else if (userFound.role === RolesEnum.SuperAdmin) {
      throw new ForbiddenException('You cannot change the role of a super admin')
    } else if (role === RolesEnum.SuperAdmin) {
      throw new ForbiddenException('You cannot assign this role')
    }
    userFound.role = role;
    await this.super_adminRepository.update(userFound)
    return `The user: ${userFound.email} now has the role of: ${userFound.role}`
  }
  
  async getOverview() {
    const allUsers = await this.super_adminRepository.findAll();
    const totalUsers = allUsers.length;
    const totalDoctors = allUsers.filter(user => user.role === RolesEnum.Medic).length;
    const totalSecretaries = allUsers.filter(user => user.role === RolesEnum.Secretary).length;
    const activeUsers = allUsers.filter(user => user.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;
    return {
      totalUsers,
      totalDoctors,
      totalSecretaries,
      activeUsers,
      inactiveUsers
    }
  }
}
