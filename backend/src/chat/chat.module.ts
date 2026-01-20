import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatIAModule } from './chatIA/chatIA.module';
import { UserModule } from '../user/user.module';
import { DoctorModule } from '../doctor/doctor.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { SpecialityModule } from '../speciality/speciality.module';
import { PaymentsModule } from '../payments/payments.module';
import { ChatSessionService } from './chatIA/chatIA-memory.service';
import { ChatIAService } from './chatIA/chatIA.service';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '../doctor/schedule/schedule.module';

@Module({
  imports: [
     TypeOrmModule.forFeature([User]),
     ChatIAModule,
     UserModule,
     DoctorModule,
     ScheduleModule,
     AppointmentsModule, 
     SpecialityModule,
     PaymentsModule
    ],
  controllers: [ChatController],
  providers: [
    ChatService, 
    ChatSessionService,
    ChatIAService
  ],
})
export class ChatModule {}
