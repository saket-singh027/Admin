import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as path from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  // const reflector = app.get(Reflector);

  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new GrpcAuthGuard(reflector, app.get(AUTH_SERVICE_NAME)));

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
