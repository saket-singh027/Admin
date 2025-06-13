// import { UserPayload } from './../../generated/auth';
// import {
//   CanActivate,
//   ExecutionContext,
//   Inject,
//   Injectable,
//   OnModuleInit,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ClientGrpc } from '@nestjs/microservices';
// import { firstValueFrom } from 'rxjs';
// import { AUTH_SERVICE_NAME, AuthServiceClient } from 'src/generated/auth';

// @Injectable()
// export class AdminGuard implements CanActivate, OnModuleInit {
//   private authService: AuthServiceClient;

//   constructor(
//     private reflector: Reflector,
//     @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
//   ) {}

//   onModuleInit() {
//     this.authService =
//       this.authClient.getService<AuthServiceClient>('AuthService');
//   }

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const isPublic = this.reflector.get<boolean>(
//       'isPublic',
//       context.getHandler(),
//     );

//     if (isPublic) return true;

//     const request = context.switchToHttp().getRequest();
//     // const authHeader = request.headers('authorization');
//     // const headers = request.headers;
//     const authHeader = request.headers['authorization'];

//     if (!authHeader)
//       throw new UnauthorizedException('Authorization token not found');

//     const accessToken: string = authHeader.split(' ')[1];

//     if (!accessToken) throw new UnauthorizedException('Token not found');

//     try {
//       const payload: UserPayload = await firstValueFrom(
//         this.authService.validateToken({ accessToken }),
//       );
//       request.user = payload;
//       return true;
//     } catch {
//       throw new UnauthorizedException('Invalid or expired token');
//     }
//   }
// }
