import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../user/user.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
} from './dto';
import {
  AuthResponse,
  TokenPayload,
  RegisterResponse,
  LoginResponse,
} from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto, ipAddress?: string): Promise<RegisterResponse> {
    // 检查用户名是否存在
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否存在
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('邮箱已被注册');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 生成 Token
    const tokens = await this.generateTokens(user.id, user.username);

    // 存储 Refresh Token
    await this.saveRefreshToken(user.id, tokens.refreshToken, ipAddress);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto, ipAddress?: string): Promise<LoginResponse> {
    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查账号状态
    if (user.status === 'BANNED') {
      throw new UnauthorizedException('账号已被禁用');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('账号未激活');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成 Token
    const tokens = await this.generateTokens(user.id, user.username);

    // 存储 Refresh Token
    await this.saveRefreshToken(user.id, tokens.refreshToken, ipAddress);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  /**
   * 刷新 Token
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto, ipAddress?: string): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    // 验证 Refresh Token
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh Token 无效');
    }

    // 检查是否已撤销
    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh Token 已失效');
    }

    // 检查是否过期
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh Token 已过期');
    }

    // 撤销旧 Token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // 生成新 Token
    const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.username);

    // 存储新 Refresh Token
    await this.saveRefreshToken(storedToken.user.id, tokens.refreshToken, ipAddress);

    return {
      user: {
        id: storedToken.user.id,
        username: storedToken.user.username,
        email: storedToken.user.email,
        role: storedToken.user.role,
      },
      ...tokens,
    };
  }

  /**
   * 登出
   */
  async logout(refreshToken: string): Promise<void> {
    // 撤销 Refresh Token
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * 验证 Token 并获取用户信息
   */
  async validateToken(payload: TokenPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status === 'BANNED') {
      return null;
    }

    return user;
  }

  // ============ 私有方法 ============

  /**
   * 生成 Access Token 和 Refresh Token
   */
  private async generateTokens(
    userId: number,
    username: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = { sub: userId, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * 保存 Refresh Token
   */
  private async saveRefreshToken(
    userId: number,
    token: string,
    ipAddress?: string,
  ): Promise<void> {
    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn');
    const expiresAt = this.calculateExpiresAt(expiresIn || '30d');

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        ipAddress,
      },
    });
  }

  /**
   * 计算过期时间
   */
  private calculateExpiresAt(expiresIn: string): Date {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 默认 30 天
    }

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + num * (multipliers[unit] || multipliers.d));
  }
}
