import { Module } from "@nestjs/common";
import { SecretaryController } from "./secretary.controller";
import { SecretaryService } from "./secretary.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { UserModule } from "../user/user.module";
import { User } from "../user/entities/user.entity";
import { DoctorModule } from "../doctor/doctor.module";
import { Doctor } from "../doctor/entities/doctor.entity";
import { Speciality } from "../speciality/entities/speciality.entity";
import { SpecialityModule } from "../speciality/speciality.module";

@Module({
    imports: [ TypeOrmModule.forFeature([User, Doctor, Speciality]),
        UserModule, 
        DoctorModule,
        SpecialityModule,
        CloudinaryModule
    ],
    controllers: [SecretaryController],
    providers: [SecretaryService]
})
export class secretaryModule {}