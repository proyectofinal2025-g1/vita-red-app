import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SuperAdminRepository } from './super-admin.repository';
import { RolesEnum } from '../user/enums/roles.enum';
import { SpecialityEnum } from './enum/speciality.enum';
import { DashboardKpisResponseDto } from './dto/back-office/dashboard-kpis.response.dto';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';
import { MonthlyAppointmentsResponseDto } from './dto/back-office/monthly-appointments.response.dto';
import { MonthlyRevenueResponseDto } from './dto/back-office/monthly-revenue.response.dto';
import { AppointmentStatusResponseDto } from './dto/back-office/appointment-status.response.dto';

@Injectable()
export class SuperAdminService {
  constructor(private readonly super_adminRepository: SuperAdminRepository) {}

  private getMonthName(monthNumber: number): string {
    return new Date(Date.UTC(2025, monthNumber - 1, 1)).toLocaleString(
      'en-US',
      {
        month: 'long',
      },
    );
  }

  async findAll(role?: RolesEnum, isActive?: boolean) {
    return await this.super_adminRepository.findAll(role, isActive);
  }

  async findAllDoctors(specialty?: SpecialityEnum) {
    if (specialty && !Object.values(SpecialityEnum).includes(specialty)) {
      throw new BadRequestException(
        'Validation failed (enum string is expected)',
      );
    }
    return await this.super_adminRepository.findAllDoctors(specialty);
  }

  async updateActive(id: string) {
    const userFound = await this.super_adminRepository.findOne(id);
    if (!userFound) {
      throw new NotFoundException(`User with id: ${id} not found.`);
    } else if (userFound.role === RolesEnum.SuperAdmin) {
      throw new ForbiddenException('You cannot disable a super admin');
    }
    userFound.is_active = !userFound.is_active;
    await this.super_adminRepository.update(userFound);
    return !userFound.is_active
      ? 'User successfully deactivated'
      : 'User successfully activated';
  }

  async updateRole(id: string, role: RolesEnum) {
    const userFound = await this.super_adminRepository.findOne(id);
    if (!userFound) {
      throw new NotFoundException(`User with id: ${id} not found.`);
    } else if (userFound.role === RolesEnum.SuperAdmin) {
      throw new ForbiddenException(
        'You cannot change the role of a super admin',
      );
    } else if (role === RolesEnum.SuperAdmin) {
      throw new ForbiddenException('You cannot assign this role');
    }
    userFound.role = role;
    await this.super_adminRepository.update(userFound);
    return `The user: ${userFound.email} now has the role of: ${userFound.role}`;
  }

  async getOverview() {
    const allUsers = await this.super_adminRepository.findAll();
    const totalUsers = allUsers.length;
    const totalDoctors = allUsers.filter(
      (user) => user.role === RolesEnum.Medic,
    ).length;
    const activeUsers = allUsers.filter((user) => user.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;
    return {
      totalUsers,
      totalDoctors,
      activeUsers,
      inactiveUsers,
    };
  }

  async getDashboardKpis(year: number): Promise<DashboardKpisResponseDto> {
    // 🔐 UTC EXPLÍCITO (NO depende del servidor ni del deploy)
    const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    const now = new Date();
    const startOfMonthUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
    );
    const endOfMonthUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59),
    );

    // 📊 Datos crudos (repository)
    const totalAppointments =
      await this.super_adminRepository.countAppointmentsByDateRange(
        startOfYear,
        endOfYear,
      );

    const confirmedAppointments =
      await this.super_adminRepository.countAppointmentsByDateRange(
        startOfYear,
        endOfYear,
        AppointmentStatus.CONFIRMED,
      );

    const cancelledAppointments =
      await this.super_adminRepository.countAppointmentsByDateRange(
        startOfYear,
        endOfYear,
        AppointmentStatus.CANCELLED,
      );

    const appointmentsThisMonth =
      await this.super_adminRepository.countAppointmentsByDateRange(
        startOfMonthUTC,
        endOfMonthUTC,
      );

    const totalRevenueRaw =
      await this.super_adminRepository.sumAppointmentPriceByDateRange(
        startOfYear,
        endOfYear,
      );

    const totalRevenue = totalRevenueRaw;

    return {
      totalAppointments,
      appointmentsThisMonth,
      confirmedAppointments,
      cancelledAppointments,
      totalRevenue,
    };
  }

  async getMonthlyAppointments(
    year: number,
  ): Promise<MonthlyAppointmentsResponseDto[]> {
    const rawData =
      await this.super_adminRepository.countAppointmentsGroupedByMonth(year);

    return rawData.map((item) => ({
      month: this.getMonthName(Number(item.month)),
      totalAppointments: Number(item.total),
    }));
  }

  async getMonthlyRevenue(year: number): Promise<MonthlyRevenueResponseDto[]> {
    const rawData =
      await this.super_adminRepository.sumPriceGroupedByMonth(year);

    return rawData.map((item) => ({
      month: this.getMonthName(Number(item.month)),
      revenue: Number(item.revenue),
    }));
  }

  async getAppointmentsByStatus(
    year: number,
  ): Promise<AppointmentStatusResponseDto[]> {
    const rawData =
      await this.super_adminRepository.countAppointmentsGroupedByStatus(year);

    return rawData.map((item) => ({
      status: item.status,
      total: Number(item.total),
    }));
  }
}
