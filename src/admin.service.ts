import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
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
import { POST_SERVICE_NAME, PostServiceClient } from './generated/post';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, adminDocument } from './schemas/admin.schema';
import { Model, Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Post, PostDocument } from './schemas/post.schema';
import { User, UserDocument } from './schemas/user.schema';
import {
  NotificationResponse,
  notificationServiceClient,
} from './generated/notification';
@Injectable()
export class AdminService implements OnModuleInit {
  private authService: AuthServiceClient;
  private userService: UserServiceClient;
  private userAdminService: AdminServiceClient;
  private postService: PostServiceClient;
  private notificationService: notificationServiceClient;
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Admin.name) private adminModel: Model<adminDocument>,
    @Inject('AUTH_PACKAGE') private readonly authClient: ClientGrpc,
    @Inject(USER_SERVICE_NAME) private readonly userClient: ClientGrpc,
    @Inject(POST_SERVICE_NAME) private readonly postClient: ClientGrpc,
    @Inject('NOTIFICATION_PACKAGE')
    private readonly notificationClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>('AuthService');

    this.userService =
      this.userClient.getService<UserServiceClient>('UserService');

    this.postService =
      this.postClient.getService<PostServiceClient>('PostService');

    this.notificationService =
      this.notificationClient.getService<notificationServiceClient>(
        'notificationService',
      );
  }

  //Admin Seeding and Verification.

  async createAdmin(email: string, password: string): Promise<Admin | null> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.adminModel({
      email,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async ValidateAdmin(
    password: string,
    payload: TokenPayload,
  ): Promise<Observable<TokenResponse>> {
    const admin = (await this.adminModel
      .findOne({ email: payload.email })
      .exec()) as adminDocument;
    if (!admin) throw new Error('Admin not found');
    else {
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        throw new Error('Admin password is incorrect');
      }
    }
    payload.userId = (admin._id as any).toString();
    return this.authService.generateToken(payload);
  }

  FindOne(id: string): Promise<User | null> {
    // return this.userService.findOne({ id }); // gRPC version
    return this.userModel.findById(id).exec();
  }

  FindAll(page: number, limit: number): Observable<UsersResponse> {
    return this.userService.findAll({ page, limit }); // gRPC version
    // const skip = (page - 1) * limit;
    // return this.userModel.find().skip(skip).limit(limit).exec();
  }

  FindByEmail(email: string): Promise<User | null> {
    // return this.userService.findByEmail({ email }); // gRPC version
    return this.userModel.findOne({ email }).exec();
  }

  async BanUser(targetId: string, reason: string): Promise<User> {
    const admin = await this.adminModel.findOne({ email: 'admin' }).exec();
    if (!admin) throw new BadRequestException('Admin not found');

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        targetId,
        {
          isBanned: true,
          banReason: reason,
        },
        { new: true },
      )
      .exec();

    if (!updatedUser) throw new NotFoundException('User not found');

    return updatedUser;
  }

  async UnbanUser(targetId: string): Promise<User> {
    const admin = await this.adminModel.findOne({ email: 'admin' }).exec();
    if (!admin) throw new BadRequestException('Admin not found');

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        targetId,
        {
          isBanned: false,
          banReason: null,
        },
        { new: true },
      )
      .exec();

    if (!updatedUser) throw new NotFoundException('User not found');

    return updatedUser;
  }

  async GetFollowers(userId: string): Promise<string[]> {
    // return this.userService.getFollowers({ userId }); // gRPC version
    const user = await this.userModel.findById(userId).exec();
    return user?.followers ?? [];
  }

  async GetFollowing(userId: string): Promise<string[]> {
    // return this.userService.getFollowing({ userId }); // gRPC version
    const user = await this.userModel.findById(userId).exec();
    return user?.following ?? [];
  }

  FindByUsername(username: string): Promise<User | null> {
    // return this.userService.findByUsername({ username }); // gRPC version
    return this.userModel.findOne({ username }).exec();
  }

  // Post Service

  allPosts(): Promise<Post[]> {
    // return this.postService.getAllPosts({}); // gRPC version
    return this.postModel.find().exec();
  }

  reportedPosts(): Promise<Post[]> {
    // return this.postService.getReportedPosts({}); // gRPC version
    return this.postModel.find({ isReported: true }).exec();
  }

  adminDeletePost(id: string): Promise<Post | null> {
    // return this.postService.adminDeletePost({ id }); // gRPC version
    return this.postModel.findByIdAndDelete(id).exec();
  }

  FlagPost(id: string, reason: string): Promise<Post | null> {
    // return this.postService.flagPost({ id, reason }); // gRPC version
    return this.postModel
      .findByIdAndUpdate(
        id,
        {
          isReported: true,
          reportReason: reason,
        },
        { new: true },
      )
      .exec();
  }
  sendGlobalNotifications(
    title: string,
    body: string,
  ): Observable<NotificationResponse> {
    return this.notificationService.sendGlobalNotification({ title, body });
  }

  sendPersonalNotification(
    userId: string,
    title: string,
    body: string,
  ): Observable<NotificationResponse> {
    return this.notificationService.sendUserNotification({
      userId,
      title,
      body,
    });
  }
}
