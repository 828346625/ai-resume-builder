# AI 简历构建器 - 企业级架构设计文档

## 1. 整体架构概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              负载均衡层                                     │
│                         (Nginx / 云负载均衡)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
          ┌──────────────────┐               ┌──────────────────┐
          │   Web 前端集群    │               │   API 服务集群    │
          │   (CDN 加速)     │               │   (多实例部署)    │
          └────────┬─────────┘               └────────┬─────────┘
                   │                                    │
                   ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           网关层 / BFF 层                                   │
│                    (统一入口 - 鉴权 - 限流 - 路由)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
          ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
          │   用户服务      │ │   简历服务      │ │   AI 服务      │
          │  (User Svc)    │ │ (Resume Svc)   │ │  (AI Svc)      │
          └────────────────┘ └────────────────┘ └────────────────┘
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              数据访问层 (DAL)                                │
│                        (Redis Cache / MySQL / MongoDB)                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 项目目录结构

```
ai-resume-builder/
│
├── docs/                          # 项目文档
│   ├── api/                       # API 文档 (OpenAPI/Swagger)
│   ├── architecture/              # 架构设计文档
│   └── guides/                    # 开发指南
│
├── packages/                      # Monorepo 共享包
│   ├── common/                    # 公共库
│   │   ├── constants/             # 常量定义
│   │   ├── errors/                # 统一错误类
│   │   ├── utils/                 # 工具函数
│   │   ├── types/                 # 共享类型定义
│   │   └── index.ts
│   │
│   └── config/                    # 共享配置
│       ├── index.ts
│       └── environments/          # 环境配置
│
├── apps/
│   ├── api-gateway/               # API 网关服务
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/            # 中间件、守卫、拦截器
│   │   │   │   ├── guards/         # 认证守卫、角色守卫
│   │   │   │   ├── interceptors/   # 日志、响应、错误拦截器
│   │   │   │   ├── middlewares/    # CORS、压缩、请求日志
│   │   │   │   ├── filters/        # 异常过滤器
│   │   │   │   └── decorators/      # 自定义装饰器
│   │   │   ├── modules/            # 功能模块
│   │   │   │   ├── auth/           # 认证模块
│   │   │   │   ├── user/           # 用户模块
│   │   │   │   ├── resume/          # 简历模块
│   │   │   │   └── ai/              # AI 模块
│   │   │   └── config/             # 配置模块
│   │   ├── test/                  # 测试文件
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                       # 前端应用
│       ├── src/
│       │   ├── app/               # 主应用
│       │   │   ├── app.tsx
│       │   │   ├── app.config.ts
│       │   │   └── providers/      # 全局 providers
│       │   │
│       │   ├── pages/             # 页面组件
│       │   │   ├── home/
│       │   │   ├── auth/
│       │   │   │   ├── login/
│       │   │   │   └── register/
│       │   │   ├── resume/
│       │   │   │   ├── list/
│       │   │   │   ├── editor/
│       │   │   │   ├── preview/
│       │   │   │   └── templates/  # 简历模板
│       │   │   └── settings/
│       │   │
│       │   ├── components/        # 业务组件
│       │   │   ├── ui/            # 基础 UI 组件
│       │   │   ├── forms/         # 表单组件
│       │   │   ├── layout/        # 布局组件
│       │   │   └── resume/        # 简历相关组件
│       │   │
│       │   ├── features/          # 功能模块 (Colocation)
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   └── resumes/
│       │   │
│       │   ├── hooks/             # 自定义 Hooks
│       │   ├── services/          # API 服务
│       │   ├── stores/            # 状态管理
│       │   ├── types/             # 类型定义
│       │   ├── utils/             # 工具函数
│       │   ├── assets/            # 静态资源
│       │   └── styles/            # 全局样式
│       │
│       ├── public/
│       ├── test/
│       ├── Dockerfile
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.ts
│
├── services/                      # 微服务 (可选拆分)
│   ├── user-service/              # 用户服务
│   ├── resume-service/             # 简历服务
│   └── ai-service/                # AI 服务
│
├── infra/                         # 基础设施
│   ├── docker/                    # Docker 配置
│   │   ├── docker-compose.yml
│   │   └── services/
│   ├── k8s/                      # Kubernetes 配置
│   ├── ci-cd/                    # CI/CD 流水线
│   │   ├── .github/
│   │   │   └── workflows/
│   │   └── .gitlab-ci/
│   └── monitoring/               # 监控配置
│       ├── prometheus/
│       └── grafana/
│
├── scripts/                       # 运维脚本
│   ├── db/
│   │   ├── migrations/           # 数据库迁移
│   │   └── seeders/              # 数据填充
│   └── deploy/
│
├── .env.example                   # 环境变量示例
├── .eslintrc.js                   # ESLint 配置
├── .prettierrc                    # Prettier 配置
├── package.json                   # 根 package.json
├── pnpm-workspace.yaml           # Monorepo 配置
├── tsconfig.base.json            # 基础 TS 配置
├── README.md
└── CHANGELOG.md
```

---

## 3. 后端分层架构 (NestJS 风格)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Controller 层                             │
│         (接收请求、参数校验、路由分发、响应格式化)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Guard 层                                 │
│              (认证、JWT 验证、角色权限、接口限流)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Interceptor 层                             │
│           (日志记录、响应包装、错误处理、性能监控)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Service 层                                │
│           (业务逻辑、事务管理、缓存策略、事件发布)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Repository 层                               │
│                (数据访问、ORM 操作、查询构建)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Cache 层                                 │
│                     (Redis 缓存、分布式锁)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.1 后端模块详细结构

```
apps/api-gateway/src/
├── main.ts                        # 应用入口
├── app.module.ts                  # 根模块
│
├── common/                        # 公共模块
│   ├── decorators/
│   │   ├── current-user.decorator.ts    # 获取当前用户
│   │   ├── roles.decorator.ts           # 角色权限
│   │   ├── public.decorator.ts          # 跳过认证
│   │   └── transform.decorator.ts       # 响应转换
│   │
│   ├── filters/
│   │   ├── http-exception.filter.ts     # HTTP 异常过滤
│   │   └── all-exceptions.filter.ts     # 全局异常过滤
│   │
│   ├── guards/
│   │   ├── jwt-auth.guard.ts            # JWT 认证守卫
│   │   ├── roles.guard.ts               # 角色守卫
│   │   └── throttler.guard.ts          # 限流守卫
│   │
│   ├── interceptors/
│   │   ├── logging.interceptor.ts       # 请求日志
│   │   ├── transform.interceptor.ts     # 响应包装
│   │   └── timeout.interceptor.ts       # 请求超时
│   │
│   ├── middlewares/
│   │   ├── request-logger.middleware.ts # 请求日志中间件
│   │   └── correlation-id.middleware.ts  # 请求链路追踪
│   │
│   └── pipes/
│       ├── validation.pipe.ts           # 参数验证
│       └── parse-int.pipe.ts            # 类型转换
│
├── config/                        # 配置模块
│   ├── config.module.ts
│   ├── config.service.ts
│   └── configuration.ts           # 配置结构定义
│
└── modules/                       # 功能模块
    ├── auth/                      # 认证模块
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── strategies/
    │   │   └── jwt.strategy.ts
    │   ├── dto/
    │   │   ├── login.dto.ts
    │   │   ├── register.dto.ts
    │   │   └── refresh-token.dto.ts
    │   └── entities/
    │       └── token.entity.ts
    │
    ├── user/                     # 用户模块
    │   ├── user.module.ts
    │   ├── user.controller.ts
    │   ├── user.service.ts
    │   ├── dto/
    │   │   ├── create-user.dto.ts
    │   │   ├── update-user.dto.ts
    │   │   └── query-user.dto.ts
    │   └── entities/
    │       └── user.entity.ts
    │
    ├── resume/                   # 简历模块
    │   ├── resume.module.ts
    │   ├── resume.controller.ts
    │   ├── resume.service.ts
    │   ├── dto/
    │   │   ├── create-resume.dto.ts
    │   │   ├── update-resume.dto.ts
    │   │   ├── query-resume.dto.ts
    │   │   └── generate-resume.dto.ts
    │   ├── entities/
    │   │   ├── resume.entity.ts
    │   │   ├── work-experience.entity.ts
    │   │   └── education.entity.ts
    │   └── repositories/
    │       └── resume.repository.ts
    │
    └── ai/                       # AI 模块
        ├── ai.module.ts
        ├── ai.controller.ts
        ├── ai.service.ts
        ├── dto/
        │   └── generate-points.dto.ts
        └── providers/
            └── deepseek.provider.ts
```

---

## 4. 前端架构设计

### 4.1 前端目录结构 (Feature-Based)

```
apps/web/src/
├── app/
│   ├── app.tsx                   # 根组件
│   ├── app.config.ts             # 应用配置
│   ├── app.routes.ts            # 路由配置
│   │
│   └── providers/
│       ├── query-provider.tsx   # TanStack Query Provider
│       ├── auth-provider.tsx     # 认证 Provider
│       └── toast-provider.tsx   # Toast 通知
│
├── pages/                        # 页面组件 (路由组件)
│   ├── _layout.tsx              # 布局组件
│   ├── home.page.tsx
│   ├── auth/
│   │   ├── login.page.tsx
│   │   ├── register.page.tsx
│   │   └── forgot-password.page.tsx
│   ├── resume/
│   │   ├── list.page.tsx       # 简历列表
│   │   ├── editor.page.tsx     # 简历编辑
│   │   ├── preview.page.tsx    # 简历预览
│   │   └── templates.page.tsx  # 模板选择
│   └── settings/
│       ├── profile.page.tsx
│       └── security.page.tsx
│
├── components/                  # 共享组件
│   ├── ui/                      # 基础 UI 组件 (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── layout/                  # 布局组件
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── user-menu.tsx
│   │
│   ├── forms/                   # 表单组件
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── resume-form.tsx
│   │   └── form-field.tsx
│   │
│   └── resume/                  # 简历组件
│       ├── resume-card.tsx
│       ├── resume-editor.tsx
│       ├── resume-preview.tsx
│       └── templates/
│           ├── classic-template.tsx
│           ├── modern-template.tsx
│           └── professional-template.tsx
│
├── features/                    # 功能模块 (自包含)
│   ├── auth/
│   │   ├── api/                 # API 调用
│   │   │   └── auth.api.ts
│   │   ├── hooks/
│   │   │   ├── use-login.ts
│   │   │   └── use-register.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── components/
│   │       └── auth-form.tsx
│   │
│   ├── users/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── components/
│   │
│   └── resumes/
│       ├── api/
│       │   ├── resume.api.ts
│       │   └── ai.api.ts
│       ├── hooks/
│       │   ├── use-resumes.ts
│       │   ├── use-resume.ts
│       │   ├── use-create-resume.ts
│       │   ├── use-update-resume.ts
│       │   └── use-ai-generate.ts
│       ├── types/
│       │   └── resume.types.ts
│       ├── stores/
│       │   └── resume.store.ts  # Zustand Store
│       └── components/
│           ├── resume-list.tsx
│           ├── resume-form.tsx
│           ├── work-experience-form.tsx
│           └── education-form.tsx
│
├── hooks/                        # 全局 Hooks
│   ├── use-user.ts
│   ├── use-auth.ts
│   └── use-toast.ts
│
├── services/                     # API 服务层
│   ├── api-client.ts            # Axios 实例
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── resume.service.ts
│
├── stores/                      # 全局状态管理
│   ├── auth.store.ts            # 认证状态
│   └── ui.store.ts              # UI 状态
│
├── types/                        # 全局类型
│   ├── api.types.ts
│   ├── user.types.ts
│   └── resume.types.ts
│
├── utils/                        # 工具函数
│   ├── cn.ts                    # className 合并
│   ├── format-date.ts
│   ├── validators.ts            # 表单验证
│   └── api.utils.ts
│
├── styles/
│   └── globals.css
│
└── main.tsx
```

---

## 5. 数据库设计

### 5.1 实体关系图

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │    resumes      │       │  resume_versions │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)          │
│ username        │  │    │ user_id (FK)    │──┼───▶│ resume_id (FK)  │
│ email           │  │    │ name            │  │    │ version          │
│ password_hash   │  └───▶│ job_title       │  │    │ data (JSON)      │
│ status          │       │ email           │  │    │ created_at       │
│ email_verified  │       │ phone           │  │    └─────────────────┘
│ created_at      │       │ summary         │  │
│ updated_at      │       │ is_default      │  │
└─────────────────┘       │ template_id     │  │
                           │ created_at     │  │
                           │ updated_at     │  │
                           └────────┬────────┘  │
                                    │           │
              ┌─────────────────────┼───────────┤
              │                     │           │
    ┌─────────▼─────────┐ ┌─────────▼─────┐ ┌───▼───────────┐
    │ work_experiences  │ │  educations   │ │     skills     │
    ├───────────────────┤ ├───────────────┤ ├───────────────┤
    │ id (PK)           │ │ id (PK)       │ │ id (PK)       │
    │ resume_id (FK)    │ │ resume_id(FK) │ │ resume_id(FK) │
    │ company           │ │ school        │ │ name          │
    │ position          │ │ degree        │ │ level         │
    │ start_date        │ │ major         │ │ created_at    │
    │ end_date          │ │ start_date    │ └───────────────┘
    │ description       │ │ end_date      │
    │ created_at        │ │ gpa           │
    └───────────────────┘ │ created_at    │
                          └───────────────┘

┌─────────────────┐       ┌─────────────────┐
│  resume_templates│       │    audit_logs   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ user_id (FK)    │
│ thumbnail_url   │       │ action          │
│ config (JSON)   │       │ entity_type     │
│ is_public       │       │ entity_id       │
│ created_by (FK) │       │ old_data (JSON) │
│ created_at      │       │ new_data (JSON) │
│ updated_at      │       │ ip_address      │
└─────────────────┘       │ user_agent      │
                          │ created_at      │
                          └─────────────────┘
```

### 5.2 表结构定义

```sql
-- 用户表
CREATE TABLE users (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status        ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at DATETIME,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME NULL,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 简历表
CREATE TABLE resumes (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT UNSIGNED NOT NULL,
    name          VARCHAR(100) NOT NULL,
    job_title     VARCHAR(100),
    email         VARCHAR(100),
    phone         VARCHAR(20),
    summary       TEXT,
    template_id   BIGINT UNSIGNED,
    is_default    BOOLEAN DEFAULT FALSE,
    version       INT UNSIGNED DEFAULT 1,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 简历版本历史表
CREATE TABLE resume_versions (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resume_id     BIGINT UNSIGNED NOT NULL,
    version       INT UNSIGNED NOT NULL,
    data          JSON NOT NULL,
    change_summary VARCHAR(500),
    created_by    BIGINT UNSIGNED,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY uk_resume_version (resume_id, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 工作经历表
CREATE TABLE work_experiences (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resume_id     BIGINT UNSIGNED NOT NULL,
    company       VARCHAR(100) NOT NULL,
    position      VARCHAR(100) NOT NULL,
    start_date    DATE,
    end_date      DATE,
    description   TEXT,
    sort_order    INT UNSIGNED DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume_id (resume_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 教育经历表
CREATE TABLE educations (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resume_id     BIGINT UNSIGNED NOT NULL,
    school        VARCHAR(100) NOT NULL,
    degree        VARCHAR(50),
    major         VARCHAR(100),
    start_date    DATE,
    end_date      DATE,
    gpa           DECIMAL(3,2),
    sort_order    INT UNSIGNED DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume_id (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 技能表
CREATE TABLE skills (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resume_id     BIGINT UNSIGNED NOT NULL,
    name          VARCHAR(50) NOT NULL,
    level         ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    sort_order    INT UNSIGNED DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume_id (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 简历模板表
CREATE TABLE resume_templates (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    thumbnail_url VARCHAR(500),
    config        JSON NOT NULL,
    is_public     BOOLEAN DEFAULT FALSE,
    created_by    BIGINT UNSIGNED,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 操作审计日志表
CREATE TABLE audit_logs (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT UNSIGNED,
    action        VARCHAR(50) NOT NULL,
    entity_type   VARCHAR(50) NOT NULL,
    entity_id     BIGINT UNSIGNED,
    old_data      JSON,
    new_data      JSON,
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(500),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6. API 设计规范

### 6.1 RESTful API 结构

```
基础 URL: /api/v1

认证接口:
POST   /auth/register          # 用户注册
POST   /auth/login             # 用户登录
POST   /auth/logout            # 用户登出
POST   /auth/refresh           # 刷新 Token
POST   /auth/forgot-password   # 忘记密码
POST   /auth/reset-password    # 重置密码

用户接口:
GET    /users/me               # 获取当前用户
PUT    /users/me               # 更新当前用户
PUT    /users/me/password      # 修改密码
DELETE /users/me               # 删除账户

简历接口:
GET    /resumes                # 获取简历列表
POST   /resumes                # 创建简历
GET    /resumes/:id            # 获取简历详情
PUT    /resumes/:id            # 更新简历
DELETE /resumes/:id            # 删除简历
POST   /resumes/:id/duplicate  # 复制简历
PUT    /resumes/:id/default    # 设为默认

简历子资源:
GET    /resumes/:id/versions   # 获取版本历史
GET    /resumes/:id/versions/:v # 获取特定版本

AI 接口:
POST   /ai/generate-summary    # AI 生成简历摘要
POST   /ai/generate-points     # AI 生成简历要点
POST   /ai/optimize-content   # AI 优化内容

模板接口:
GET    /templates              # 获取模板列表
GET    /templates/:id         # 获取模板详情
```

### 6.2 统一响应格式

```typescript
// 成功响应
{
  "code": 0,
  "message": "操作成功",
  "data": { ... },
  "meta": {
    "timestamp": "2026-04-28T10:30:00.000Z",
    "requestId": "req_abc123"
  }
}

// 分页响应
{
  "code": 0,
  "message": "查询成功",
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}

// 错误响应
{
  "code": 40001,
  "message": "参数校验失败",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "meta": {
    "timestamp": "2026-04-28T10:30:00.000Z",
    "requestId": "req_abc123"
  }
}
```

### 6.3 错误码规范

```
1xxxx - 通用错误
  10001 - 参数校验失败
  10002 - 资源不存在
  10003 - 权限不足

2xxxx - 认证错误
  20001 - Token 无效
  20002 - Token 已过期
  20003 - 用户名或密码错误
  20004 - 账号已被禁用

3xxxx - 业务错误
  30001 - 简历不存在
  30002 - 简历保存失败
  30003 - AI 服务调用失败
```

---

## 7. 技术选型汇总

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **后端框架** | NestJS | 模块化、依赖注入、装饰器 |
| **ORM** | Prisma | 类型安全、自动迁移 |
| **数据库** | MySQL 8.0 | TiDB Cloud / Aurora |
| **缓存** | Redis | 缓存、Session、分布式锁 |
| **前端框架** | React 18 + Next.js 14 | App Router、SSR |
| **状态管理** | TanStack Query + Zustand | 服务端 + 客户端状态 |
| **UI 组件** | shadcn/ui + Tailwind CSS | 现代化组件库 |
| **构建工具** | Vite / Turborepo | 快速构建、Monorepo |
| **API 文档** | Swagger / OpenAPI 3.0 | 自动生成 |
| **测试** | Jest + Playwright | 单元 + E2E |
| **容器化** | Docker + Docker Compose | 本地开发 |
| **CI/CD** | GitHub Actions | 自动部署 |
| **监控** | Prometheus + Grafana | 性能监控 |
| **日志** | ELK Stack | 日志收集分析 |
| **安全** | JWT + RBAC | 认证授权 |

---

## 8. 实施路线图

### Phase 1: 基础设施 (Week 1-2)
- [ ] 搭建 Monorepo 结构
- [ ] 配置 ESLint + Prettier + Husky
- [ ] 搭建 Docker 开发环境
- [ ] 配置 GitHub Actions CI/CD

### Phase 2: 后端核心 (Week 3-5)
- [ ] 迁移到 NestJS 框架
- [ ] 实现用户认证模块 (JWT + RBAC)
- [ ] 实现简历 CRUD 模块
- [ ] 集成 Prisma ORM
- [ ] 添加 Redis 缓存层
- [ ] 实现 API 限流和日志

### Phase 3: AI 服务 (Week 6)
- [ ] 重构 AI 服务模块
- [ ] 添加 AI 限流和重试机制
- [ ] 实现 AI 缓存策略

### Phase 4: 前端升级 (Week 7-9)
- [ ] 迁移到 Next.js
- [ ] 实现路由和权限控制
- [ ] 重构简历编辑器
- [ ] 实现简历模板系统
- [ ] 添加简历预览和导出

### Phase 5: 高级功能 (Week 10-12)
- [ ] 简历版本管理
- [ ] 操作审计日志
- [ ] 性能优化
- [ ] 安全加固
- [ ] 监控告警

---

## 9. 关键设计决策

### 9.1 为什么选择 NestJS?
- 与当前 Express 项目迁移成本低
- 内置装饰器模式与当前设计理念一致
- 企业级特性开箱即用
- TypeScript 原生支持

### 9.2 为什么选择 Prisma?
- 类型安全的数据库访问
- 自动生成迁移脚本
- 直观的 CRUD API
- 支持数据库预览

### 9.3 为什么选择 Next.js?
- 服务端渲染利于 SEO
- API Routes 可简化后端
- 成熟的开发生态
- Vercel 一键部署

### 9.4 为什么选择 Monorepo?
- 代码共享便捷
- 统一版本管理
- 跨项目重构方便
- CI/CD 流水线统一
