import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  QueryUserDto,
} from './dto';
import { PaginatedResult } from '../../common/constants';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto) {
    // 检查用户名
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * 分页查询用户
   */
  async findAll(query: QueryUserDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, username, email, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (username) where.username = { contains: username };
    if (email) where.email = { contains: email };
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      list,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 根据 ID 查询用户
   */
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户信息
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查邮箱唯一性
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('邮箱已被注册');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 修改密码
   */
  async updatePassword(id: number, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ConflictException('当前密码错误');
    }

    // 加密新密码
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // 更新密码
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });

    // 撤销所有 Refresh Token
    await this.prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { revokedAt: new Date() },
    });

    return { message: '密码修改成功' };
  }

  /**
   * 删除用户（软删除）
   */
  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: '用户已删除' };
  }
}
