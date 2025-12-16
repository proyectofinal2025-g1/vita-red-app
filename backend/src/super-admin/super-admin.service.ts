import { Injectable } from '@nestjs/common';

@Injectable()
export class SuperAdminService {
  create(createSuperAdminDto) {
    return 'This action adds a new superAdmin';
  }

  findAll() {
    return `This action returns all superAdmin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} superAdmin`;
  }

  update(id: number, updateSuperAdminDto) {
    return `This action updates a #${id} superAdmin`;
  }

  remove(id: number) {
    return `This action removes a #${id} superAdmin`;
  }
}
