import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'john_doe', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3, { message: '用户名至少需要 3 个字符' })
  @MaxLength(50, { message: '用户名不能超过 50 个字符' })
  @Transform(({ value }) => value?.trim())
  username: string;

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ description: '密码', example: 'Password123!', minLength: 6, maxLength: 128 })
  @IsString()
  @MinLength(6, { message: '密码至少需要 6 个字符' })
  @MaxLength(128, { message: '密码不能超过 128 个字符' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ description: '密码', example: 'Password123!' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh Token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token 不能为空' })
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty({ description: 'Refresh Token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh Token 不能为空' })
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '当前密码' })
  @IsString()
  @IsNotEmpty({ message: '当前密码不能为空' })
  currentPassword: string;

  @ApiProperty({ description: '新密码', minLength: 6, maxLength: 128 })
  @IsString()
  @MinLength(6, { message: '新密码至少需要 6 个字符' })
  @MaxLength(128, { message: '新密码不能超过 128 个字符' })
  newPassword: string;
}
