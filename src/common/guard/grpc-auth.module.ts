import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GrpcAuthGuard } from './grpc-auth.guard';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(process.cwd(), 'src/proto/auth.proto'),
          url: 'localhost:50052',
          loader: { 
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
          },
        },
      },
    ]),
  ],
  providers: [GrpcAuthGuard],
  exports: [GrpcAuthGuard,ClientsModule],
})
export class GrpcAuthModule {}
