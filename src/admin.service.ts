import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  AUTH_SERVICE_NAME,
  AuthRequest,
  AuthResponse,
  AuthServiceClient,
} from './generated/auth';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  USER_SERVICE_NAME,
  GetUserRequest,
  UserListResponse,
  UserResponse,
  UserServiceClient,
} from './generated/user';
import {
  POST_SERVICE_NAME,
  PostList,
  PostResponse,
  postServiceClient,
} from './generated/post';

@Injectable()
export class AdminService implements OnModuleInit {
  private authService: AuthServiceClient;
  private userService: UserServiceClient;
  private postService: postServiceClient;
  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
    @Inject(USER_SERVICE_NAME) private readonly userClient: ClientGrpc,
    @Inject(POST_SERVICE_NAME) private readonly postClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>('AuthService');

    this.userService =
      this.userClient.getService<UserServiceClient>('UserService');

    this.postService =
      this.postClient.getService<postServiceClient>('PostService');
  }

  //AUTH SERVICE

  login(payload: AuthRequest): Observable<AuthResponse> {
    return this.authService.generateToken(payload);
  }

  // USER SERVICE

  getAllUser(): Observable<UserListResponse> {
    return this.userService.getAllUsers({});
  }

  getUser(userId: string): Observable<UserResponse> {
    const request: GetUserRequest = {
      userId,
      requesterRole: 'admin',
    };
    return this.userService.getUser(request);
  }

  blockUser(userId: string): Observable<UserResponse> {
    return this.userService.blockUser({ userId, requesterRole: 'admin' });
  }

  getTopInfluencer(): Observable<UserListResponse> {
    return this.userService.getTopInfluencer({});
  }

  // POST SERVICE

  getAllPosts(): Observable<PostList> {
    return this.postService.allPosts({});
  }

  reportedPost(): Observable<PostList> {
    return this.postService.reportedPosts({});
  }

  deletePost(postId: string): Observable<PostResponse> {
    return this.postService.deletePost({ postId });
  }

  FlagPost(postId: string, reason: string): Observable<PostResponse> {
    return this.postService.flagPost({ postId, reason });
  }

  // NOTIFICATION SERVICE
}
