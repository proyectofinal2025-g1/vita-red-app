import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Secretary } from "./entities/secretary.entity";
import { Repository } from "typeorm";

@Injectable()
export class SecretaryRepository {
  constructor(
    @InjectRepository(Secretary)
    private readonly secretaryRepository: Repository<Secretary>,
  ){}

  async findAll(){
    return this.secretaryRepository.find()
  }

  async findOne(id: string){
    return this.secretaryRepository.findOneBy({id})
  }
  
  async remove(id: string){
    return this.secretaryRepository.delete(id)
  }
}