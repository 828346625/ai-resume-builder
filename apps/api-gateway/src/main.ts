import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api');

  // API 版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // CORS 配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  // 全局管道 - 参数验证
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 移除未定义的属性
      forbidNonWhitelisted: true, // 拒绝未定义的属性
      transform: true, // 自动类型转换
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局过滤器 - 异常处理
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器 - 响应转换
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局拦截器 - 日志
  app.useGlobalInterceptors(new LoggerInterceptor());

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('AI Resume Builder API')
    .setDescription('AI 简历构建器 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证相关接口')
    .addTag('users', '用户相关接口')
    .addTag('resumes', '简历相关接口')
    .addTag('ai', 'AI 相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 Application is running on:                           ║
  ║   👉 http://localhost:${port}/api                          ║
  ║   📚 Swagger Docs: http://localhost:${port}/api/docs       ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
