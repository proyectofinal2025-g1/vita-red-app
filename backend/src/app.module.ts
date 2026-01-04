import { Module, OnModuleInit } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { secretaryModule } from './secretary/secretary.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as dotenvConfig } from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { SpecialityModule } from './speciality/speciality.module';
import { SeederService } from './seed/seed.service';
import { SeedModule } from './seed/seed.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentsModule } from './payments/payments.module';
import { NotificationModule } from './notification/notification.module';
import { MedicalRecordModule } from './medical-record/medical-record.module';
import { AuthGoogleModule } from './auth/google/auth.google.module'

dotenvConfig({ path: './.env.development' });

@Module({
  imports: [
    ScheduleModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const typeormConfig = configService.get('typeorm');
        if (!typeormConfig) {
          throw new Error('TypeORM configuration not found');
        }
        return typeormConfig;
      },
    }),
    UserModule,
    secretaryModule,
    AuthModule,
    CloudinaryModule,
    SpecialityModule,
    DoctorModule,
    SeedModule,
    SuperAdminModule,
    NotificationModule,
    MedicalRecordModule,
    AppointmentsModule,
    PaymentsModule,
    AuthGoogleModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.seederService.seedSuperAdmin();
      await this.seederService.run();
    }
  }
}
