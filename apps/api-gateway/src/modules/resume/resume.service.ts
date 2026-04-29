import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResumeRepository } from './repositories/resume.repository';
import {
  CreateResumeDto,
  UpdateResumeDto,
  QueryResumeDto,
} from './dto';
import { PaginatedResult } from '../../common/constants';

@Injectable()
export class ResumeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resumeRepository: ResumeRepository,
  ) {}

  /**
   * 创建简历
   */
  async create(userId: number, createResumeDto: CreateResumeDto) {
    // 如果设为默认，取消其他默认
    if (createResumeDto.isDefault) {
      await this.clearDefaultResume(userId);
    }

    return this.prisma.$transaction(async (tx) => {
      // 创建简历
      const resume = await tx.resume.create({
        data: {
          userId,
          name: createResumeDto.name,
          jobTitle: createResumeDto.jobTitle,
          email: createResumeDto.email,
          phone: createResumeDto.phone,
          summary: createResumeDto.summary,
          templateId: createResumeDto.templateId,
          isDefault: createResumeDto.isDefault || false,
        },
      });

      // 创建工作经历
      if (createResumeDto.workExperiences?.length) {
        await tx.workExperience.createMany({
          data: createResumeDto.workExperiences.map((exp, index) => ({
            resumeId: resume.id,
            company: exp.company,
            position: exp.position,
            startDate: exp.startDate ? new Date(exp.startDate) : null,
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            description: exp.description,
            sortOrder: index,
          })),
        });
      }

      // 创建教育经历
      if (createResumeDto.educations?.length) {
        await tx.education.createMany({
          data: createResumeDto.educations.map((edu, index) => ({
            resumeId: resume.id,
            school: edu.school,
            degree: edu.degree,
            major: edu.major,
            startDate: edu.startDate ? new Date(edu.startDate) : null,
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            gpa: edu.gpa,
            sortOrder: index,
          })),
        });
      }

      // 创建技能
      if (createResumeDto.skills?.length) {
        await tx.skill.createMany({
          data: createResumeDto.skills.map((skill, index) => ({
            resumeId: resume.id,
            name: skill.name,
            level: skill.level,
            sortOrder: index,
          })),
        });
      }

      // 创建初始版本记录
      await tx.resumeVersion.create({
        data: {
          resumeId: resume.id,
          version: 1,
          data: createResumeDto,
          changeSummary: '初始版本',
        },
      });

      return this.getResumeWithRelations(resume.id);
    });
  }

  /**
   * 分页查询简历
   */
  async findAll(userId: number, query: QueryResumeDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, name, jobTitle } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (name) where.name = { contains: name };
    if (jobTitle) where.jobTitle = { contains: jobTitle };

    const [list, total] = await Promise.all([
      this.prisma.resume.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          template: {
            select: { id: true, name: true, thumbnailUrl: true },
          },
          _count: {
            select: { workExperiences: true, educations: true, skills: true },
          },
        },
      }),
      this.prisma.resume.count({ where }),
    ]);

    return {
      list,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 根据 ID 查询简历
   */
  async findById(userId: number, resumeId: number) {
    const resume = await this.getResumeWithRelations(resumeId);

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException('无权访问此简历');
    }

    return resume;
  }

  /**
   * 更新简历
   */
  async update(userId: number, resumeId: number, updateResumeDto: UpdateResumeDto) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException('无权修改此简历');
    }

    // 如果设为默认，取消其他默认
    if (updateResumeDto.isDefault) {
      await this.clearDefaultResume(userId);
    }

    return this.prisma.$transaction(async (tx) => {
      // 获取当前版本号
      const currentVersion = resume.version;

      // 更新简历基本信息
      const updatedResume = await tx.resume.update({
        where: { id: resumeId },
        data: {
          name: updateResumeDto.name ?? resume.name,
          jobTitle: updateResumeDto.jobTitle ?? resume.jobTitle,
          email: updateResumeDto.email ?? resume.email,
          phone: updateResumeDto.phone ?? resume.phone,
          summary: updateResumeDto.summary ?? resume.summary,
          templateId: updateResumeDto.templateId ?? resume.templateId,
          isDefault: updateResumeDto.isDefault ?? resume.isDefault,
          version: currentVersion + 1,
        },
      });

      // 更新工作经历
      if (updateResumeDto.workExperiences !== undefined) {
        // 删除旧的
        await tx.workExperience.deleteMany({ where: { resumeId } });
        // 创建新的
        if (updateResumeDto.workExperiences.length) {
          await tx.workExperience.createMany({
            data: updateResumeDto.workExperiences.map((exp, index) => ({
              resumeId,
              company: exp.company,
              position: exp.position,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description,
              sortOrder: index,
            })),
          });
        }
      }

      // 更新教育经历
      if (updateResumeDto.educations !== undefined) {
        await tx.education.deleteMany({ where: { resumeId } });
        if (updateResumeDto.educations.length) {
          await tx.education.createMany({
            data: updateResumeDto.educations.map((edu, index) => ({
              resumeId,
              school: edu.school,
              degree: edu.degree,
              major: edu.major,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              gpa: edu.gpa,
              sortOrder: index,
            })),
          });
        }
      }

      // 更新技能
      if (updateResumeDto.skills !== undefined) {
        await tx.skill.deleteMany({ where: { resumeId } });
        if (updateResumeDto.skills.length) {
          await tx.skill.createMany({
            data: updateResumeDto.skills.map((skill, index) => ({
              resumeId,
              name: skill.name,
              level: skill.level,
              sortOrder: index,
            })),
          });
        }
      }

      // 创建版本记录
      await tx.resumeVersion.create({
        data: {
          resumeId,
          version: currentVersion + 1,
          data: updateResumeDto,
          changeSummary: updateResumeDto.changeSummary,
          createdById: userId,
        },
      });

      return this.getResumeWithRelations(resumeId);
    });
  }

  /**
   * 删除简历
   */
  async remove(userId: number, resumeId: number) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException('无权删除此简历');
    }

    // 软删除
    await this.prisma.resume.update({
      where: { id: resumeId },
      data: { deletedAt: new Date() },
    });

    return { message: '简历已删除' };
  }

  /**
   * 复制简历
   */
  async duplicate(userId: number, resumeId: number) {
    const originalResume = await this.findById(userId, resumeId);

    return this.prisma.$transaction(async (tx) => {
      // 创建新简历
      const newResume = await tx.resume.create({
        data: {
          userId,
          name: `${originalResume.name} (副本)`,
          jobTitle: originalResume.jobTitle,
          email: originalResume.email,
          phone: originalResume.phone,
          summary: originalResume.summary,
          templateId: originalResume.templateId,
          isDefault: false,
        },
      });

      // 复制工作经历
      if (originalResume.workExperiences?.length) {
        await tx.workExperience.createMany({
          data: originalResume.workExperiences.map((exp) => ({
            resumeId: newResume.id,
            company: exp.company,
            position: exp.position,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description,
            sortOrder: exp.sortOrder,
          })),
        });
      }

      // 复制教育经历
      if (originalResume.educations?.length) {
        await tx.education.createMany({
          data: originalResume.educations.map((edu) => ({
            resumeId: newResume.id,
            school: edu.school,
            degree: edu.degree,
            major: edu.major,
            startDate: edu.startDate,
            endDate: edu.endDate,
            gpa: edu.gpa,
            sortOrder: edu.sortOrder,
          })),
        });
      }

      // 复制技能
      if (originalResume.skills?.length) {
        await tx.skill.createMany({
          data: originalResume.skills.map((skill) => ({
            resumeId: newResume.id,
            name: skill.name,
            level: skill.level,
            sortOrder: skill.sortOrder,
          })),
        });
      }

      return this.getResumeWithRelations(newResume.id);
    });
  }

  /**
   * 设为默认简历
   */
  async setDefault(userId: number, resumeId: number) {
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException('无权操作此简历');
    }

    await this.clearDefaultResume(userId);

    await this.prisma.resume.update({
      where: { id: resumeId },
      data: { isDefault: true },
    });

    return { message: '已设为默认简历' };
  }

  /**
   * 获取版本历史
   */
  async getVersions(userId: number, resumeId: number) {
    // 先验证权限
    await this.findById(userId, resumeId);

    const versions = await this.prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        changeSummary: true,
        createdAt: true,
        createdBy: {
          select: { id: true, username: true },
        },
      },
    });

    return versions;
  }

  // ============ 私有方法 ============

  private async getResumeWithRelations(resumeId: number) {
    return this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        workExperiences: {
          orderBy: { sortOrder: 'asc' },
        },
        educations: {
          orderBy: { sortOrder: 'asc' },
        },
        skills: {
          orderBy: { sortOrder: 'asc' },
        },
        template: {
          select: { id: true, name: true, thumbnailUrl: true },
        },
      },
    });
  }

  private async clearDefaultResume(userId: number) {
    await this.prisma.resume.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
}
