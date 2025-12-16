import { Module, OnModuleInit } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { secretaryModule } from './secretaria/secretary.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as dotenvConfig } from "dotenv"
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { SpecialityModule } from './speciality/speciality.module';
import { SeederService } from './seed/seed.service';
import { SeedModule } from './seed/seed.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

dotenvConfig({ path: './.env.development' })

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' }
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const typeormConfig = configService.get('typeorm')
        if (!typeormConfig) {
          throw new Error('TypeORM configuration not found');
        }
        return typeormConfig
      }
    }), UserModule, secretaryModule,  AuthModule, CloudinaryModule],
  controllers: [],
  providers: [],
}) 
export class AppModule implements OnModuleInit {
  constructor(
    private readonly doctorsSeeder: SeederService,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.doctorsSeeder.run();
    }
  }
}