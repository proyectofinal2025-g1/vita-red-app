import { Module } from '@nestjs/common';
import { GoogleStrategy } from './config/configGoogle';
import { AuthGoogleController } from './auth.google.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth.module';


@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AuthGoogleController],
  providers: [GoogleStrategy],
})
export class AuthGoogleModule {}