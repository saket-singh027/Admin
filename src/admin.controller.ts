import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  Get,
  Param,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { firstValueFrom } from 'rxjs';
import { Public } from './common/decorators/public.decorator';
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  //Auth Micro Service.
  @Public()
  @Post('create-admin')
  async create(
    @Body()
    body: {
      email: string;
      password: string;
      adminId: string;
    },
  ) {
    return this.adminService.createAdmin(
      body.email,
      body.password,
      body.adminId,
    );
  }

  @Public()
  @Post('login')
  async login(
    @Body()
    body: { userId: string; email: string; role: string; password: string },
    @Headers('postman-token') userAgent: string,
    @Req() req,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']; //NOSONAR

    const payload = {
      userId: body.userId,
      email: body.email,
      role: body.role,
      deviceId: 'TestId',
      ipAddress,
      userAgent,
    };

    const result = await firstValueFrom(
      await this.adminService.ValidateAdmin(body.email, body.password, payload),
    );
    return result;
  }

  // User MicroService .
  // @Public()
  @Get('AllUsers')
  getAllUsers(@Body() body: { page: number; limit: number }) {
    return this.adminService.FindAll(body.page, body.limit);
  }

  // @Get('top-influencer')
  // getTopinfluencers() {
  //   return this.adminService.getTopInfluencer();
  // }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.adminService.FindOne(id);
  }

  @Post(':id/ban')
  banUser(@Param('id') id: string, @Body() reason: string) {
    return this.adminService.BanUser(id, reason);
  }

  @Post('find-by-email')
  findByEmail(@Body() email: string) {
    return this.adminService.FindByEmail(email);
  }

  @Post('unban-user/:id')
  unbanUser(@Param('id') id: string) {
    return this.adminService.UnbanUser(id);
  }

  @Post('followers/:id')
  getFollowers(@Param('id') id: string) {
    this.adminService.GetFollowers(id);
  }

  @Post('following/:id')
  getFollowing(@Param('id') id: string) {
    this.adminService.GetFollowing(id);
  }

  @Post('find-username')
  findByUsername(@Body() username: string) {
    this.adminService.FindByUsername(username);
  }

  // post controllers.

  @Get('all-posts')
  getAllPosts() {
    return this.adminService.allPosts();
  }

  @Get('reported-posts')
  getReportedPosts() {
    return this.adminService.reportedPosts();
  }

  @Post('flag-post/:id')
  flagPost(@Param('id') id: string, @Body() body: string) {
    return this.adminService.FlagPost(id, body);
  }

  @Post('delete-post/:id')
  deletePost(@Param('id') id: string) {
    return this.adminService.adminDeletePost(id);
  }
}
