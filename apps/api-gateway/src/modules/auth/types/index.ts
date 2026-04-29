import { UserRole } from '../../common/constants';

export interface TokenPayload {
  sub: number;      // 用户 ID
  username: string;
  iat?: number;     // 签发时间
  exp?: number;     // 过期时间
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse extends AuthResponse {}

export interface LoginResponse extends AuthResponse {}
