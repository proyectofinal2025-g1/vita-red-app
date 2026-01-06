import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from './seed.service';
import { SeedRootModule } from './seed-root.module';

async function bootstrap() { 
  const app = await NestFactory.createApplicationContext(SeedRootModule);

  const seeder = app.get(SeederService);
  await seeder.seedSuperAdmin();
  await seeder.run();

  await app.close();
}

bootstrap();
