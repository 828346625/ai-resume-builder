import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { Public } from '../../common/decorators';
import {
  GenerateSummaryDto,
  GeneratePointsDto,
  OptimizeContentDto,
} from './dto';

@ApiTags('ai')
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('generate-summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI 生成简历摘要' })
  @ApiResponse({ status: 200, description: '生成成功' })
  @ApiResponse({ status: 500, description: 'AI 服务错误' })
  generateSummary(@Body() dto: GenerateSummaryDto) {
    return this.aiService.generateSummary(dto);
  }

  @Public()
  @Post('generate-points')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI 生成简历要点' })
  @ApiResponse({ status: 200, description: '生成成功' })
  @ApiResponse({ status: 500, description: 'AI 服务错误' })
  generatePoints(@Body() dto: GeneratePointsDto) {
    return this.aiService.generatePoints(dto);
  }

  @Public()
  @Post('optimize-content')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI 优化内容' })
  @ApiResponse({ status: 200, description: '优化成功' })
  @ApiResponse({ status: 500, description: 'AI 服务错误' })
  optimizeContent(@Body() dto: OptimizeContentDto) {
    return this.aiService.optimizeContent(dto);
  }
}
