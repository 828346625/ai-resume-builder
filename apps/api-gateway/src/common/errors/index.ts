import { ResponseCode } from '../constants';

export interface IErrorResponse {
  code: number;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  meta?: {
    timestamp: string;
    requestId: string;
    path?: string;
  };
}

export class AppError extends Error {
  constructor(
    public code: number,
    message: string,
    public errors?: Array<{ field?: string; message: string }>,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors?: Array<{ field?: string; message: string }>) {
    super(ResponseCode.BAD_REQUEST, message, errors);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '未授权') {
    super(ResponseCode.UNAUTHORIZED, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '权限不足') {
    super(ResponseCode.FORBIDDEN, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(ResponseCode.NOT_FOUND, message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: Array<{ field?: string; message: string }>) {
    super(ResponseCode.VALIDATION_ERROR, message, errors);
    this.name = 'ValidationError';
  }
}

export class AuthTokenInvalidError extends AppError {
  constructor(message = 'Token 无效') {
    super(ResponseCode.AUTH_TOKEN_INVALID, message);
    this.name = 'AuthTokenInvalidError';
  }
}

export class AuthTokenExpiredError extends AppError {
  constructor(message = 'Token 已过期') {
    super(ResponseCode.AUTH_TOKEN_EXPIRED, message);
    this.name = 'AuthTokenExpiredError';
  }
}

export class UserNotFoundError extends AppError {
  constructor(message = '用户不存在') {
    super(ResponseCode.USER_NOT_FOUND, message);
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(message = '用户已存在') {
    super(ResponseCode.USER_ALREADY_EXISTS, message);
    this.name = 'UserAlreadyExistsError';
  }
}

export class ResumeNotFoundError extends AppError {
  constructor(message = '简历不存在') {
    super(ResponseCode.RESUME_NOT_FOUND, message);
    this.name = 'ResumeNotFoundError';
  }
}
