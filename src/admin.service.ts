import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  AUTH_SERVICE_NAME,
  TokenPayload,
  TokenResponse,
  AuthServiceClient,
} from './generated/auth';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  AdminServiceClient,
  USER_SERVICE_NAME,
  UserResponse,
  UserServiceClient,
  UsersResponse,
} from './generated/user';
import {
  POST_SERVICE_NAME,
  PostList,
  PostResponse,
  PostServiceClient,
} from './generated/post';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, adminDocument } from './schemas/admin.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class AdminService implements OnModuleInit {
  private authService: AuthServiceClient;
  private userService: UserServiceClient;
  private userAdminService: AdminServiceClient;
  private postService: PostServiceClient;
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<adminDocument>,
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
      this.postClient.getService<PostServiceClient>('PostService');
  }

  //Admin Seeding and Verification.

  async createAdmin(
    email: string,
    password: string,
    adminId: string,
  ): Promise<Admin | null> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.adminModel({
      email,
      password: hashedPassword,
      adminId,
    });
    return newUser.save();
  }

  async ValidateAdmin(
    email: string,
    password: string,
    payload: TokenPayload,
  ): Promise<Observable<TokenResponse>> {
    const admin = await this.adminModel.findOne({ email });
    if (!admin) throw new Error('Admin not found');
    else {
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        throw new Error('Admin password is incorrect');
      }
    }
    return this.authService.generateToken(payload);
  }

  FindOne(id: string): Observable<UserResponse> {
    return this.userService.findOne({ id });
  }

  FindAll(page: number, limit: number): Observable<UsersResponse> {
    return this.userService.findAll({ page, limit });
  }

  FindByEmail(email: string): Observable<UserResponse> {
    return this.userService.findByEmail({ email });
  }

  async BanUser(
    targetId: string,
    reason: string,
  ): Promise<Observable<UserResponse>> {
    const admin = await this.adminModel.findOne({ email: 'admin' });
    if (!admin) throw new BadRequestException('admin not found');
    else
      return this.userAdminService.banUser({
        adminId: admin.adminId,
        targetId,
        reason,
      });
  }

  async UnbanUser(targetId: string): Promise<Observable<UserResponse>> {
    const admin = await this.adminModel.findOne({ email: 'admin' });
    if (!admin) throw new BadRequestException('admin not found');
    return this.userAdminService.unbanUser({
      adminId: admin.adminId,
      targetId,
    });
  }

  GetFollowers(userId: string): Observable<UsersResponse> {
    return this.userService.getFollowers({ userId });
  }

  GetFollowing(userId: string): Observable<UsersResponse> {
    return this.userService.getFollowing({ userId });
  }

  FindByUsername(username: string): Observable<UserResponse> {
    return this.userService.findByUsername({ username });
  }

  // Post Service

  allPosts(): Observable<PostList> {
    return this.postService.AllPosts({});
  }

  reportedPosts(): Observable<PostList> {
    return this.postService.reportedPosts({});
  }

  adminDeletePost(postId: string): Observable<PostResponse> {
    return this.postService.adminDeletePost({ postId });
  }

  FlagPost(postId: string, reason: string): Observable<PostResponse> {
    return this.postService.flagPost({ postId, reason });
  }

  // NOTIFICATION SERVICE
}
