import { Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { SeedModule } from './seed.module';

@Module({
  imports: [
    AppModule,
    SeedModule,
  ],
})
export class SeedRootModule {}
