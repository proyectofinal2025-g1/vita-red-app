import { Module } from '@nestjs/common';
import { GoogleStrategy } from './config/configGoogle';
import { AuthGoogleController } from './auth.google.controller';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule],
  controllers: [AuthGoogleController],
  providers: [GoogleStrategy],
})
export class AuthGoogleModule {}