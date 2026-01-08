import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatIAModule } from './chatIA/chatIA.module';
import { UserModule } from '../user/user.module';
import { DoctorModule } from '../doctor/doctor.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { SpecialityModule } from '../speciality/speciality.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [ChatIAModule,
     UserModule,
     DoctorModule, 
     AppointmentsModule, 
     SpecialityModule,
     PaymentsModule
    ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
