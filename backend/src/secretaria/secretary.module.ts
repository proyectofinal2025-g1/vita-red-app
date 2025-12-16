import { Module } from "@nestjs/common";
import { SecretaryController } from "./secretary.controller";
import { SecretaryService } from "./secretary.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Secretary } from "./entities/secretary.entity";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { UserModule } from "../user/user.module";

@Module({
    imports: [TypeOrmModule.forFeature([Secretary]),
    UserModule,
     CloudinaryModule],
    controllers: [SecretaryController],
    providers: [SecretaryService]
})
export class secretaryModule {}