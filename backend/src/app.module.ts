import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { secretaryModule } from './secretaria/secretary.module';


@Module({
  imports: [UserModule, secretaryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
