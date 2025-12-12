import { Body, Controller, Delete, Get, Param, Patch } from "@nestjs/common";
import { SecretaryService } from "./secretary.service";

@Controller('secretary')
export class SecretaryController {
    constructor(private readonly secretaryService: SecretaryService) { }


    @Get()
    findAll() {
        return this.secretaryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.secretaryService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSecretaryDto: any) {
        return this.secretaryService.update(id, updateSecretaryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.secretaryService.remove(id);
    }

}