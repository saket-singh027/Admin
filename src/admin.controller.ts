import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { firstValueFrom } from 'rxjs';
import { Public } from './common/decorators/public.decorator';
import { GrpcAuthGuard } from './common/guard/grpc-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  //Auth Micro Service.
  @Post('create-admin')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.adminService.createAdmin(body.email, body.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(
    @Body()
    data: { email: string; password: string },
    @Headers('postman-token') userAgent: string,
    @Req() req,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const payload = {
      email: data.email,
      userId: 'temp',
      role: 'admin',
      deviceId: 'TestId',
      ipAddress,
      userAgent,
    };

    const result = await firstValueFrom(
      await this.adminService.ValidateAdmin(data.password, payload),
    );
    return result;
  }

  @UseGuards(GrpcAuthGuard)
  @Get('AllUsers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', type: Number, example: 1, required: false })
  @ApiQuery({ name: 'limit', type: Number, example: 10, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAllUsers(@Query() query: { page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.adminService.FindAll(page, limit);
  }

  // @UseGuards(GrpcAuthGuard)
  // @Post(':id/ban')
  // banUser(@Param('id') id: string, @Body() reason: string) {
  //   return this.adminService.BanUser(id, reason);
  // }

  @UseGuards(GrpcAuthGuard)
  @Post('find-by-email')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find user by email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByEmail(@Body() email: string) {
    return this.adminService.FindByEmail(email);
  }

  // @UseGuards(GrpcAuthGuard)
  // @Post('unban-user/:id')
  // unbanUser(@Param('id') id: string) {
  //   return this.adminService.UnbanUser(id);
  // }

  @UseGuards(GrpcAuthGuard)
  @Post('followers/:id')
  getFollowers(@Param('id') id: string) {
    this.adminService.GetFollowers(id);
  }

  @UseGuards(GrpcAuthGuard)
  @Post('following/:id')
  getFollowing(@Param('id') id: string) {
    this.adminService.GetFollowing(id);
  }

  @UseGuards(GrpcAuthGuard)
  @Post('find-username')
  findByUsername(@Body() username: string) {
    this.adminService.FindByUsername(username);
  }

  // post controllers.
  @UseGuards(GrpcAuthGuard)
  @Get('all-posts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({
    status: 200,
    description: 'List of posts retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAllPosts() {
    return this.adminService.allPosts();
  }

  @UseGuards(GrpcAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('id') id: string) {
    return this.adminService.FindOne(id);
  }

  @UseGuards(GrpcAuthGuard)
  @Get('reported-posts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reported posts' })
  @ApiResponse({
    status: 200,
    description: 'List of reported posts retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getReportedPosts() {
    return this.adminService.reportedPosts();
  }

  @UseGuards(GrpcAuthGuard)
  @Post('flag-post/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Flag a post' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Inappropriate content' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Post flagged successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  flagPost(@Param('id') id: string, @Body() body: string) {
    return this.adminService.FlagPost(id, body);
  }

  @UseGuards(GrpcAuthGuard)
  @Post('delete-post/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  deletePost(@Param('id') id: string) {
    return this.adminService.adminDeletePost(id);
  }

  @Post('sendGlobalNotification')
  sendGlobalNotifications(@Body() content: { title: string; body: string }) {
    return this.adminService.sendGlobalNotifications(content.title, content.body);
  }

  @Post('sendPersonalNotification')
  sendPersonalNotification(
    @Body() content: { userId: string; title: string; body: string },
  ) {
    return this.adminService.sendPersonalNotification(
      content.userId,
      content.title,
      content.body,
    );
  }
}
