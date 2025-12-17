import { Module } from "@nestjs/common";
import { SecretaryController } from "./secretary.controller";
import { SecretaryService } from "./secretary.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { UserModule } from "../user/user.module";
import { SecretaryRepository } from "./secretary.repository";
import { User } from "../user/entities/user.entity";

@Module({
    imports: [ TypeOrmModule.forFeature([User]),
        UserModule, 
        CloudinaryModule
    ],
    controllers: [SecretaryController],
    providers: [SecretaryService, SecretaryRepository]
})
export class secretaryModule {}