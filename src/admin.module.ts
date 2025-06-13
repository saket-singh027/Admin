import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME } from './generated/auth';
import { USER_SERVICE_NAME } from './generated/user';
import { POST_SERVICE_NAME } from './generated/post';
import * as path from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, adminSchema } from './schemas/admin.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://akshatsrivastava1:5mFEh9m2Xq3OMZh2@cluster0.cskfle2.mongodb.net/social_media',
    ),
    MongooseModule.forFeature([{ name: Admin.name, schema: adminSchema }]),
    ClientsModule.register([
      {
        name: AUTH_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: path.join(path.resolve(), 'src/proto/auth.proto'),
          url: '0.0.0.0:50052',
        },
      },
      {
        name: USER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: path.join(path.resolve(), 'src/proto/user.proto'),
          url: '0.0.0.0:50051',
        },
      },
      {
        name: POST_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'post',
          protoPath: path.join(path.resolve(), 'src/proto/post.proto'),
          url: '0.0.0.0:50055',
        },
      },
      {
        name: POST_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'post',
          protoPath: path.join(path.resolve(), 'src/proto/post.proto'),
          url: '0.0.0.0:50055',
        },
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
