import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../errors';
import { ResponseCode } from '../constants';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let code: number;
    let message: string;
    let errors: Array<{ field?: string; message: string }> | undefined;

    if (exception instanceof AppError) {
      status = this.getHttpStatus(exception.code);
      code = exception.code;
      message = exception.message;
      errors = exception.errors;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        code = this.mapStatusToCode(status);
        message = (resp.message as string) || exception.message;
        
        // 处理 class-validator 错误格式
        if (Array.isArray(resp.message)) {
          errors = resp.message.map((msg) => ({
            message: typeof msg === 'string' ? msg : (msg as Record<string, string>).message || JSON.stringify(msg),
            field: (msg as Record<string, string>).property,
          }));
        }
      } else {
        code = this.mapStatusToCode(status);
        message = exception.message;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = ResponseCode.INTERNAL_ERROR;
      message = '服务器内部错误';
      
      // 记录未知错误
      this.logger.error('Unknown exception:', exception);
    }

    const errorResponse = {
      code,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.headers['x-request-id'] || this.generateRequestId(),
        path: request.url,
      },
    };

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(code: number): number {
    if (code >= 20000 && code < 30000) return HttpStatus.UNAUTHORIZED;
    if (code >= 30000 && code < 40000) return HttpStatus.BAD_REQUEST;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private mapStatusToCode(status: number): number {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ResponseCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ResponseCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ResponseCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ResponseCode.NOT_FOUND;
      default:
        return ResponseCode.INTERNAL_ERROR;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
