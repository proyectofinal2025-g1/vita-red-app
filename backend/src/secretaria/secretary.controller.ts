import { Body, Controller, Delete, Get, Param, Patch, Post} from "@nestjs/common";
import { SecretaryService } from "./secretary.service";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { UpdateUserDto } from "../user/dto/update-user.dto";

@Controller('secretary')
export class SecretaryController {
    constructor(private readonly secretaryService: SecretaryService) { }

 /*          SECRETARY     */
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


    /* PATIENTS */

    @Post('patient')
    async createPatient(@Body()registerDto: CreateUserDto){
            return await this.secretaryService.createPatient(registerDto)
    }

    @Patch('patient')
    async updatePatient(@Param()id: string, @Body()updateUserDto: UpdateUserDto){
        return await this.secretaryService.updatePatient(id, updateUserDto)
    }

    @Delete('patient')
    async deletePatient(id: string){
        return await this.secretaryService.deletePatient(id)
    }
}