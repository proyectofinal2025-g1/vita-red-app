import { Module } from "@nestjs/common";
import { SecretaryController } from "./secretary.controller";
import { SecretaryService } from "./secretary.service";

@Module({
    controllers: [SecretaryController],
    providers: [SecretaryService]
})
export class secretaryModule {}