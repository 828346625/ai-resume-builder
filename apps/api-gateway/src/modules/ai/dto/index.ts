import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  MinLength,
} from 'class-validator';

export class GenerateSummaryDto {
  @ApiPropertyOptional({ description: '工作经历描述' })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({ description: '技能列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: '目标职位' })
  @IsOptional()
  @IsString()
  jobTitle?: string;
}

export class GeneratePointsDto {
  @ApiProperty({ description: '工作经历描述' })
  @IsString()
  @MinLength(10, { message: '工作描述至少需要10个字符' })
  workDescription: string;
}

export class OptimizeContentDto {
  @ApiProperty({ description: '需要优化的内容' })
  @IsString()
  @MinLength(5, { message: '内容至少需要5个字符' })
  content: string;

  @ApiPropertyOptional({ description: '内容类型', enum: ['summary', 'description'] })
  @IsOptional()
  @IsEnum(['summary', 'description'])
  type?: 'summary' | 'description';
}
