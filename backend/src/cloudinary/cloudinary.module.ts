import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryConfig } from '../config/cloudinary';

@Module({
  controllers: [],
  providers: [CloudinaryService, CloudinaryConfig],
  exports:[CloudinaryService]
})
export class CloudinaryModule {}
