import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Request');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}`;

    // 添加 requestId 到请求对象
    req.headers['x-request-id'] = requestId as string;

    const startTime = Date.now();

    // 请求开始日志
    this.logger.log(
      `[${requestId}] --> ${method} ${originalUrl} - IP: ${ip} - UA: ${userAgent}`,
    );

    // 监听响应完成
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length') || 0;

      // 响应日志
      this.logger.log(
        `[${requestId}] <-- ${method} ${originalUrl} ${statusCode} ${contentLength} - ${duration}ms`,
      );
    });

    next();
  }
}
