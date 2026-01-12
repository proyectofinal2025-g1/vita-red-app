import { Module } from "@nestjs/common";
import { ChatIAService } from "./chatIA.service";
import { ChatSessionService } from "./chatIA-memory.service";

@Module({
    providers: [ChatIAService, ChatSessionService],
    exports : [ChatIAService]
})
export class ChatIAModule {}