import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SkillLevel } from '@prisma/client';

// ============ 嵌套类型 DTO ============

export class WorkExperienceDto {
  @ApiProperty({ description: '公司名称' })
  @IsString()
  company: string;

  @ApiProperty({ description: '职位' })
  @IsString()
  position: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '工作描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class EducationDto {
  @ApiProperty({ description: '学校名称' })
  @IsString()
  school: string;

  @ApiPropertyOptional({ description: '学位' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiPropertyOptional({ description: '专业' })
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'GPA' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  gpa?: number;
}

export class SkillDto {
  @ApiProperty({ description: '技能名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: SkillLevel, description: '熟练程度' })
  @IsOptional()
  @IsEnum(SkillLevel)
  level?: SkillLevel;
}

// ============ 主 DTO ============

export class CreateResumeDto {
  @ApiProperty({ description: '姓名' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '个人简介' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '模板 ID' })
  @IsOptional()
  @IsInt()
  templateId?: number;

  @ApiPropertyOptional({ description: '是否为默认简历' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '工作经历', type: [WorkExperienceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkExperienceDto)
  workExperiences?: WorkExperienceDto[];

  @ApiPropertyOptional({ description: '教育经历', type: [EducationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  educations?: EducationDto[];

  @ApiPropertyOptional({ description: '技能', type: [SkillDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];
}

export class UpdateResumeDto {
  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '个人简介' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '模板 ID' })
  @IsOptional()
  @IsInt()
  templateId?: number;

  @ApiPropertyOptional({ description: '是否为默认简历' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '工作经历', type: [WorkExperienceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkExperienceDto)
  workExperiences?: WorkExperienceDto[];

  @ApiPropertyOptional({ description: '教育经历', type: [EducationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  educations?: EducationDto[];

  @ApiPropertyOptional({ description: '技能', type: [SkillDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @ApiPropertyOptional({ description: '版本变更说明' })
  @IsOptional()
  @IsString()
  changeSummary?: string;
}

export class QueryResumeDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '姓名（模糊搜索）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '职位（模糊搜索）' })
  @IsOptional()
  @IsString()
  jobTitle?: string;
}
