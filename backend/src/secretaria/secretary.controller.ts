import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { SecretaryService } from "./secretary.service";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { UpdateUserDto } from "../user/dto/update-user.dto";
import { RolesEnum } from "../user/enums/roles.enum";
import { ApiQuery } from "@nestjs/swagger";
import { User } from "../user/entities/user.entity";

@Controller('secretary')
export class SecretaryController {
    constructor(private readonly secretaryService: SecretaryService) { }

    @ApiQuery({
        name: 'role',
        required: false,
        enum: RolesEnum,
    })
    @ApiQuery({
        name: 'is_active',
        required: false,
        type: Boolean,
    })
    @Get()
    async findAll(
        @Query('role', new ParseEnumPipe(RolesEnum)) role?: RolesEnum,
        @Query('is_active', ParseBoolPipe) is_active?: boolean,
    ) {
        return this.secretaryService.findAll({ role, is_active });
    }


    @Get(':id/')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return await this.secretaryService.findOne(id);
    }


    @Patch(':id')
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: User) {
        return await this.secretaryService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.secretaryService.disable(id);
    }


    /* PATIENTS */

    @Post('patient')
    async createPatient(@Body() registerDto: CreateUserDto) {
        return await this.secretaryService.createPatient(registerDto)
    }

    @Patch('patient')
    async updatePatient(@Param() id: string, @Body() updateUserDto: UpdateUserDto) {
        return await this.secretaryService.updatePatient(id, updateUserDto)
    }

    @Delete('patient')
    async deletePatient(id: string) {
        return await this.secretaryService.deletePatient(id)
    }
}