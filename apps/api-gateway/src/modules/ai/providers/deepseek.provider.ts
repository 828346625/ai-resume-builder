import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class DeepseekProvider implements OnModuleInit {
  private readonly logger = new Logger(DeepseekProvider.name);
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('deepseek.apiKey') || '';
    this.baseURL = this.configService.get<string>('deepseek.baseURL') || 'https://api.deepseek.com';
    this.model = this.configService.get<string>('deepseek.model') || 'deepseek-chat';
  }

  onModuleInit() {
    if (!this.apiKey) {
      this.logger.warn('DeepSeek API Key 未配置，AI 功能将不可用');
    } else {
      this.logger.log(`DeepSeek 配置完成，使用模型: ${this.model}`);
    }
  }

  /**
   * 发送聊天请求
   */
  async chat(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API Key 未配置');
    }

    const url = `${this.baseURL}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`DeepSeek API 错误: ${response.status} - ${error}`);
      throw new Error(`AI 服务请求失败: ${response.status}`);
    }

    const data: ChatCompletionResponse = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('AI 返回格式错误');
    }

    return data.choices[0].message.content;
  }

  /**
   * 估算 Token 数量（简单估算）
   */
  estimateTokens(text: string): number {
    // 简单估算：中文约 2 字符/token，英文约 4 字符/token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars / 2 + otherChars / 4);
  }
}
