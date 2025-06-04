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

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  //Auth Micro Service.

  @Post('login')
  async login(
    @Body() body: { userId: string; password: string; role: string },
    @Headers('postman-token') postmanId: string,
    @Req() req,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const ipAddress = req.ip || req.headers['x-forwarded-for'];

    const payload = {
      ...body,
      postmanId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ipAddress,
    };

    const result = await firstValueFrom(this.adminService.login(payload));
    return result;
  }

  // User MicroService .
  @Get('AllUsers')
  getAllUsers() {
    return this.adminService.getAllUser();
  }

  @Get('top-influencer')
  getTopinfluencers() {
    return this.adminService.getTopInfluencer();
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Post(':id/block')
  blockuser(@Param('id') id: string) {
    return this.adminService.blockUser(id);
  }

  // post controllers.

  @Get('all-posts')
  getAllPosts() {
    return this.adminService.getAllPosts();
  }

  @Get('reported-posts')
  getReportedPosts() {
    return this.adminService.reportedPost();
  }

  @Post('flag-post/:id')
  flagPost(@Param('id') id: string, @Body() body: string) {
    return this.adminService.FlagPost(id, body);
  }

  @Post('delete-post')
  deletePost(@Param('id') id: string) {
    return this.adminService.deletePost(id);
  }
}
