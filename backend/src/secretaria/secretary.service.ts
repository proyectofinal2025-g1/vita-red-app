import { Injectable } from "@nestjs/common";

@Injectable()
export class SecretaryService {

    findAll() {
        return `This action returns all secretary`;
    }

    findOne(id: string) {
        return `This action returns a #${id} secretary`;
    }

    update(id: string, updateUserDto: any) {
        return `This action updates a #${id} secretary`;
    }

    remove(id: string) {
        return `This action removes a #${id} secretary`;
    }
}