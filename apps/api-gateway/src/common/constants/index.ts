// User role enum
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// User status enum
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

// API response codes
export enum ResponseCode {
  SUCCESS = 0,
  // 通用错误 10xxx
  BAD_REQUEST = 10001,
  UNAUTHORIZED = 10002,
  FORBIDDEN = 10003,
  NOT_FOUND = 10004,
  INTERNAL_ERROR = 10005,
  VALIDATION_ERROR = 10006,

  // 认证错误 20xxx
  AUTH_TOKEN_INVALID = 20001,
  AUTH_TOKEN_EXPIRED = 20002,
  AUTH_CREDENTIALS_INVALID = 20003,
  AUTH_ACCOUNT_BANNED = 20004,

  // 业务错误 30xxx
  USER_NOT_FOUND = 30001,
  USER_ALREADY_EXISTS = 30002,
  RESUME_NOT_FOUND = 30031,
  AI_SERVICE_ERROR = 30041,
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  list: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
