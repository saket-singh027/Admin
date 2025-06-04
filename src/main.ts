import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as path from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AdminModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: path.join(path.resolve(), 'src/proto/auth.proto'),
      url: '0.0.0.0:5000',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
