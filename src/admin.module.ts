import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME } from './generated/auth';
import { USER_SERVICE_NAME } from './generated/user';
import { POST_SERVICE_NAME } from './generated/post';
import * as path from 'path';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: path.join(path.resolve(), 'src/proto/auth.proto'),
          url: 'localhost:5000',
        },
      },
      {
        name: USER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: path.join(path.resolve(), 'src/proto/user.proto'),
          url: 'localhost 5001',
        },
      },
      {
        name: POST_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'post',
          protoPath: path.join(path.resolve(), 'src/proto/post.proto'),
          url: 'localhost:5002',
        },
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
