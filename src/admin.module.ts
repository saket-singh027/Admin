import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USER_SERVICE_NAME } from './generated/user';
import { POST_SERVICE_NAME } from './generated/post';
import * as path from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, adminSchema } from './schemas/admin.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GrpcAuthModule } from './common/guard/grpc-auth.module';
import * as dotenv from 'dotenv';
import { User, UserSchema } from './schemas/user.schema';
import { Post, PostSchema } from './schemas/post.schema';
import { NOTIFICATION_SERVICE_NAME } from './generated/notification';
dotenv.config();

@Module({
  imports: [
    GrpcAuthModule,

    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available globally
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
      }),
    }),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Admin.name, schema: adminSchema },
    ]),

    ClientsModule.register([
      {
        name: USER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: path.join(path.resolve(), 'src/proto/user.proto'),
          url: 'localhost:50051',
        },
      },
      {
        name: POST_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: 'post',
          protoPath: path.join(path.resolve(), 'src/proto/post.proto'),
          url: 'localhost:50055',
        },
      },
      {
        name: 'NOTIFICATION_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'notification',
          protoPath: path.join(path.resolve(), 'src/proto/notification.proto'),
          url: 'localhost:5000',
        },
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
