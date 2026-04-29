import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ResumeService } from './resume.service';
import { CurrentUser } from '../../common/decorators';
import {
  CreateResumeDto,
  UpdateResumeDto,
  QueryResumeDto,
} from './dto';

@ApiTags('resumes')
@ApiBearerAuth()
@Controller({ path: 'resumes', version: '1' })
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @ApiOperation({ summary: '创建简历' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(
    @CurrentUser('id') userId: number,
    @Body() createResumeDto: CreateResumeDto,
  ) {
    return this.resumeService.create(userId, createResumeDto);
  }

  @Get()
  @ApiOperation({ summary: '获取简历列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(
    @CurrentUser('id') userId: number,
    @Query() query: QueryResumeDto,
  ) {
    return this.resumeService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取简历详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '简历不存在' })
  findById(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resumeService.findById(userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新简历' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumeService.update(userId, id, updateResumeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除简历' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resumeService.remove(userId, id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: '复制简历' })
  @ApiResponse({ status: 201, description: '复制成功' })
  duplicate(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resumeService.duplicate(userId, id);
  }

  @Put(':id/default')
  @ApiOperation({ summary: '设为默认简历' })
  @ApiResponse({ status: 200, description: '设置成功' })
  setDefault(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resumeService.setDefault(userId, id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: '获取版本历史' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getVersions(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resumeService.getVersions(userId, id);
  }
}
