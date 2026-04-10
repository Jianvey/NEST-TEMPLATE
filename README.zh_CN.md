# Nest 模板（NestJS + Express）

一个面向生产的后端模板：NestJS + Express。内置 Prisma ORM、JWT 鉴权、BullMQ 队列、基于 Redis 的缓存/限流、Winston 日志、PM2 部署、Swagger 文档、Resend 邮件。

## 特性
- Express 优先，全局管线（守卫/拦截器/管道/过滤器）
- JWT 访问/刷新令牌，基于角色的守卫与装饰器
- Prisma 模型与生成客户端，推荐仓储模式
- BullMQ 队列与处理器/worker
- Redis 缓存与限流存储
- Winston 日志每日轮转至 `logs/**`
- Swagger 支持 URI 版本与全局前缀
- 文件上传（已预留支持）

## 环境要求
- Node `>=22.20.0`
- 推荐使用 pnpm
- 需要 Redis（缓存/限流）
- 数据库见 `src/core/prisma/schema.prisma`

## 快速开始
```zsh
pnpm install
pnpm prisma:dev   # 开发迁移并生成 Prisma 客户端
pnpm start        # 启动开发服务（Express）
```

若 `SWAGGER_ON=true`，启动横幅会显示 Swagger 地址。

## 构建与本地生产运行
```zsh
pnpm build
APP_PORT=3000 NODE_ENV=production pnpm production
```

## PM2 部署
```zsh
pnpm pm2                  # 使用 pm2.config.json 启动/重启
pnpm deploy-setup         # 首次远程部署环境初始化
pnpm deploy               # 部署到生产
```

## 常用脚本
- `pnpm prisma:dev`: 开发环境迁移并生成客户端
- `pnpm prisma:deploy`: 生产应用迁移
- `pnpm type-check`: 类型检查（不输出文件）
- `pnpm prettier` 与 `pnpm lint`：格式化与修复
- `pnpm commit`: 使用 commitizen 规范提交
- `pnpm husky-install`: 初始化 pre-commit 与 commit-msg 钩子

## 配置
通过 `src/core/config/config.config.ts` 统一管理，在全局可注入 `ConfigService`。

环境变量（示例）：
- `APP_NAME`（如 `NestTemplate`）
- `APP_PORT`（参考 `.env`）
- `APP_PREFIX`（可选，如 `/api`）
- `APP_VERSION`（如 `1` 或 `1,2`），用于 URI 版本控制
- `NODE_ENV`（`development` | `production`）
- `SWAGGER_ON`（`true|false`）、`SWAGGER_VERSION`（如 `1`）、`SWAGGER_PATH`（如 `/docs`）
- `JWT_SECRET`、`JWT_EXPIRES_IN`、`JWT_REFRESH_SECRET`、`JWT_REFRESH_EXPIRES_IN`
- `REDIS_URL`（缓存/限流）
- Resend 邮件相关（参见 `src/core/mail/*`）

## 架构概览
- 入口：`src/main.ts` 创建 `NestExpressApplication` 并执行 `src/core/bootstrap.ts`
- 启动：设置全局前缀、URI 版本、CORS、优雅停止、Express 插件、Swagger、Express 中间件
- 全局守卫/拦截器/管道/过滤器通过 `src/app.module.ts` 内的 `APP_GUARD`/`APP_INTERCEPTOR`/`APP_PIPE`/`APP_FILTER` provider 注册
- 模块：`src/modules/**`（如 `auth`、`user`、`file`）遵循 Nest 约定（控制器、服务、DTO、实体）
- Prisma：`src/core/prisma/schema.prisma`，生成类型在 `generators/`；推荐仓储层（如 `modules/user/user.repository.ts`）
- JWT：策略、守卫、装饰器在 `src/core/jwt/*`（`@SkipAuth()`、`@Roles('admin')`）
- 队列：`src/core/queue/*`，处理器在 `processors/`，注册于 `workers.module.ts`
- 日志：`src/core/logger/*` 输出至 `logs/**`

## 使用示例
```ts
// 公共健康检查
@SkipAuth()
@Get('health')
getHealth() { return { ok: true } }

// 角色保护的端点
@Roles('admin')
@Get('admin/users')
list() { return this.userService.listAdmins() }

// 通过仓储使用 Prisma
// modules/user/user.repository.ts
this.prisma.user.findMany({ where: { active: true } })
```

## 开发约定
- 仅使用 Express 适配与中间件，避免 Fastify API
- 依赖 `src/app.module.ts` 的全局管线 provider，尽量减少每路由重复配置
- 使用 `src/common/dto/{query,response}` 的共享 DTO 基类；响应由 `transform-response.interceptor.ts` 统一整形
- 通过 `CacheService` 使用缓存；键常量位于 `src/common/constants/redis-keys.constants.ts`
- BullMQ 处理器放置于 `src/core/queue/processors` 并在 `workers.module.ts` 注册
- 邮件通过 `MailService` 与 `src/core/mail/templates/*.hbs` 模板

### Worker 进程
`WorkersModule` 会注册 BullMQ 的 `WorkerHost` 处理器。如果你希望 worker 独立进程运行，可以从 `AppModule` 移除 `WorkersModule`，并单独创建 worker 入口文件（或通过环境变量做条件导入）。

## 许可
MIT
