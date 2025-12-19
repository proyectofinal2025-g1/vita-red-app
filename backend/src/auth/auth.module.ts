import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from '../user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CloudinaryModule, NotificationModule],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, UserService],
})
export class AuthModule {}
