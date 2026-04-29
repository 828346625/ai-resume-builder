import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { UserRole } from '../../common/constants';
import {
  UpdateUserDto,
  UpdatePasswordDto,
  QueryUserDto,
} from './dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getProfile(@CurrentUser('id') userId: number) {
    return this.userService.findById(userId);
  }

  @Put('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateProfile(
    @CurrentUser('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Put('me/password')
  @ApiOperation({ summary: '修改当前用户密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(userId, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: '注销当前用户账户' })
  @ApiResponse({ status: 200, description: '注销成功' })
  deleteAccount(@CurrentUser('id') userId: number) {
    return this.userService.remove(userId);
  }

  // ============ 管理员接口 ============

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '分页查询用户列表 (管理员)' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '根据 ID 获取用户信息 (管理员)' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新用户信息 (管理员)' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除用户 (管理员)' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
