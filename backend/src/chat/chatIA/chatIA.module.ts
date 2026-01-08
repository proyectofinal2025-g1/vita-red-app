import { Module } from "@nestjs/common";
import { ChatIAService } from "./chatIA.service";

@Module({
    providers: [ChatIAService],
    exports : [ChatIAService]
})
export class ChatIAModule {}