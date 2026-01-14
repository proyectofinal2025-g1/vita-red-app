import { forwardRef, Module } from "@nestjs/common";
import { SecretaryService } from "./secretary.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { UserModule } from "../user/user.module";
import { User } from "../user/entities/user.entity";
import { DoctorModule } from "../doctor/doctor.module";
import { Doctor } from "../doctor/entities/doctor.entity";
import { Speciality } from "../speciality/entities/speciality.entity";
import { SpecialityModule } from "../speciality/speciality.module";
import { Appointment } from "../appointments/entities/appointment.entity";
import { AppointmentsModule } from "../appointments/appointments.module";
import { DoctorSchedule } from "../doctor/schedule/entities/schedule.entity";
import { ScheduleModule } from "../doctor/schedule/schedule.module";

@Module({
    imports: [ TypeOrmModule.forFeature([User, Doctor, Speciality, Appointment, DoctorSchedule]),
        UserModule, 
        forwardRef(() => DoctorModule),
        forwardRef(() => ScheduleModule),
        SpecialityModule,
        AppointmentsModule,
        CloudinaryModule
    ],
    controllers: [],
    providers: [SecretaryService],
    exports: [SecretaryService]
})
export class secretaryModule {}