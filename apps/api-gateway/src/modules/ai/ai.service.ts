import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeepseekProvider } from './providers/deepseek.provider';
import {
  GenerateSummaryDto,
  GeneratePointsDto,
  OptimizeContentDto,
} from './dto';

export interface GeneratePointsResult {
  points: string[];
}

export interface GenerateSummaryResult {
  summary: string;
}

export interface OptimizeContentResult {
  optimized: string;
  suggestions: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly deepseekProvider: DeepseekProvider,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 生成简历摘要
   */
  async generateSummary(dto: GenerateSummaryDto): Promise<GenerateSummaryResult> {
    const { experience, skills, jobTitle } = dto;

    const prompt = this.buildSummaryPrompt(experience, skills, jobTitle);

    try {
      const response = await this.deepseekProvider.chat([
        {
          role: 'system',
          content: '你是一位专业的简历优化顾问，擅长撰写专业、简洁、有吸引力的简历摘要。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      // 清理响应内容
      let summary = response.trim();
      // 移除可能的 markdown 代码块
      summary = summary.replace(/^```(?:json)?\n?/g, '').replace(/\n?```$/g, '');

      return { summary };
    } catch (error) {
      this.logger.error('生成摘要失败:', error);
      // 降级返回
      return {
        summary: `具备${skills?.join('、') || '相关'}专业技能，${experience?.substring(0, 50) || '有相关工作经验'}，具备良好的学习能力和团队协作精神。`,
      };
    }
  }

  /**
   * 生成简历要点
   */
  async generatePoints(dto: GeneratePointsDto): Promise<GeneratePointsResult> {
    const { workDescription } = dto;

    const prompt = this.buildPointsPrompt(workDescription);

    try {
      const response = await this.deepseekProvider.chat([
        {
          role: 'system',
          content: `你是一个专业的简历优化助手。你的任务是：
1. 根据工作经历描述生成3条专业的简历要点
2. 每条以强有力的动词开头（如：负责、主导、优化、设计、实现）
3. 尽可能包含量化成果（如：提升30%、减少50%时间、覆盖1000+用户）
4. 每条不超过40字
5. 只返回JSON数组格式，不要有其他解释文字`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      // 解析 JSON
      let points: string[];
      const cleanedResponse = response.trim()
        .replace(/^```(?:json)?\n?/g, '')
        .replace(/\n?```$/g, '');

      try {
        points = JSON.parse(cleanedResponse);
        if (!Array.isArray(points)) {
          points = [points];
        }
      } catch {
        // 降级处理：按行分割
        points = cleanedResponse
          .split(/[\n\r]+/)
          .filter((line) => line.trim())
          .slice(0, 3);
      }

      return { points };
    } catch (error) {
      this.logger.error('生成要点失败:', error);
      // 降级返回
      return {
        points: [
          '负责核心功能开发，确保项目按时交付',
          '优化代码结构，提升系统可维护性',
          '与团队协作解决技术难题，获得好评',
        ],
      };
    }
  }

  /**
   * 优化内容
   */
  async optimizeContent(dto: OptimizeContentDto): Promise<OptimizeContentResult> {
    const { content, type } = dto;

    const prompt = `请优化以下${type === 'summary' ? '简历摘要' : '工作描述'}，使其更加专业、简洁、有说服力。

原文：
${content}

要求：
1. 保持原意
2. 使用专业术语
3. 突出成就和价值
4. 如有可能，添加量化数据`;

    try {
      const response = await this.deepseekProvider.chat([
        {
          role: 'system',
          content: '你是一位资深的人力资源专家和简历顾问，擅长优化简历内容。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const optimized = response.trim();

      return {
        optimized,
        suggestions: [
          '建议控制在200字以内',
          '可考虑添加具体数据支撑',
          '突出与目标岗位的匹配度',
        ],
      };
    } catch (error) {
      this.logger.error('优化内容失败:', error);
      return {
        optimized: content,
        suggestions: ['优化服务暂时不可用'],
      };
    }
  }

  // ============ 私有方法 ============

  private buildSummaryPrompt(
    experience?: string,
    skills?: string[],
    jobTitle?: string,
  ): string {
    let prompt = '请根据以下信息生成一段专业的简历摘要（150-200字）：\n\n';

    if (jobTitle) {
      prompt += `目标岗位：${jobTitle}\n`;
    }

    if (skills?.length) {
      prompt += `核心技能：${skills.join('、')}\n`;
    }

    if (experience) {
      prompt += `工作经历：${experience}\n`;
    }

    prompt += '\n要求：语言专业、突出成就、使用动词开头、展现个人价值';

    return prompt;
  }

  private buildPointsPrompt(workDescription: string): string {
    return `请根据以下工作经历描述，生成3条专业的简历要点。

工作经历描述：
${workDescription}

请直接返回JSON数组格式，示例：
["主导xx项目开发，上线后用户增长50%", "优化系统性能，接口响应时间缩短30%", "设计微服务架构，提升系统可扩展性"]`;
  }
}
