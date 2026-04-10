# Nest Template

[English](./README.md) | 简体中文

一个面向真实部署场景的 NestJS 11 + Express 后端模板。仓库内已经集成 Prisma、JWT 鉴权、Redis 缓存与限流、BullMQ 队列、定时任务、Cloudflare R2 文件存储、Resend 邮件、Winston 日志、Swagger 和 PM2 部署能力。

## 亮点

- 基于 NestJS 11 + Express 5 的项目结构
- 内置全局鉴权、角色守卫、参数校验、响应整形和异常过滤
- Prisma 7 + MariaDB Adapter，附带生成的枚举和类型
- JWT 访问令牌 + 签名刷新令牌 Cookie 流程
- 登录集成 Cloudflare Turnstile 人机校验
- Cloudflare R2 文件服务，支持游标分页查询和删除
- Redis 缓存、限流、Redlock 与 BullMQ 集成
- 定时执行 MySQL 备份并上传到 R2
- Swagger 文档和 Winston 每日日志轮转

## 环境要求

- Node >=24.14.0
- pnpm
- MySQL 或 MariaDB
- Redis
- Cloudflare Turnstile 与 R2 凭证
- Resend 邮件 API Key
- 如果保留内置备份任务，需要确保 `mysqldump` 在 PATH 中可用

## 项目结构

```text
src/
	app.module.ts               # 全局模块装配
	core/                       # 启动、配置、prisma、jwt、队列、定时任务、日志
	common/                     # 共享常量、DTO、守卫
	modules/
		auth/                     # 验证码、登录、刷新、登出
		user/                     # 用户资料、密码、头像、后台管理
		file/                     # R2 文件与目录管理
	tools/                      # 通用工具方法
```

## 环境文件

配置模块会先加载 `.env.${NODE_ENV}`，再加载 `.env`。

本地开发建议这样准备：

```zsh
cp .env.example .env
cp .env.development.example .env.development
```

生产环境建议这样准备：

```zsh
cp .env.example .env
cp .env.production.example .env.production
```

## 快速开始

```zsh
pnpm install
cp .env.example .env
cp .env.development.example .env.development
pnpm prisma:dev
pnpm start
```

当 `SWAGGER_ON=true` 时，启动日志会直接打印完整的 Swagger 地址。

## 常用脚本

| 脚本 | 说明 |
| --- | --- |
| `pnpm start` | 监听模式启动 Nest 开发服务 |
| `pnpm build` | 构建生产产物 |
| `pnpm production` | 用生产模式运行编译后的应用 |
| `pnpm prisma:dev` | 执行开发迁移并重新生成 Prisma Client |
| `pnpm prisma:deploy` | 在生产环境应用 Prisma 迁移 |
| `pnpm prisma:reset` | 重置开发数据库 |
| `pnpm type-check` | 按构建配置执行 TypeScript 类型检查 |
| `pnpm lint` | 运行 ESLint 并自动修复 |
| `pnpm prettier` | 格式化整个仓库 |
| `pnpm pm2` | 使用 `pm2.config.json` 启动或重启 |
| `pnpm deploy-setup` | 初始化远程 PM2 部署目标 |
| `pnpm deploy` | 强制执行 PM2 部署 |
| `pnpm commit` | 打开规范化提交向导 |
| `pnpm husky-install` | 重新生成 Husky 钩子 |

## 关键配置

环境变量校验定义在 `src/core/config/config.config.ts`。

应用基础配置：

- `APP_NAME`
- `APP_PORT`
- `APP_PREFIX`
- `APP_VERSION`
- `NODE_ENV`

Swagger：

- `SWAGGER_ON`
- `SWAGGER_PATH`
- `SWAGGER_TITLE`
- `SWAGGER_DESCRIPTION`
- `SWAGGER_VERSION`

安全与鉴权：

- `COOKIE_SECRET`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `CLOUDFLARE_TURNSTILE_SECRET`

对象存储：

- `ASSETS_PREFIX`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY`
- `CLOUDFLARE_R2_SECRET_KEY`
- `CLOUDFLARE_R2_BUCKET_NAME`
- `CLOUDFLARE_R2_ENDPOINT`

数据库与 Redis：

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `REDIS_DB`
- `REDIS_CACHE_TTL`
- `REDIS_URL`
- `THROTTLE_TTL`
- `THROTTLE_LIMIT`

邮件：

- `MAIL_API_KEY`
- `MAIL_FROM`

具体示例值请以 `.env.example`、`.env.development.example` 和 `.env.production.example` 为准。

## 内置模块

认证模块：

- `POST /auth/code`：发送登录、注册、重置密码或联系方式变更验证码
- `POST /auth/login`：邮箱 + 密码 + 6 位验证码 + Turnstile 校验
- `POST /auth/refresh`：轮换刷新令牌并返回新的访问令牌
- `POST /auth/logout`：注销当前登录会话

用户模块：

- `POST /users/`：创建用户
- `GET /users/profile`：获取当前用户资料
- `PATCH /users/password`、`PATCH /users/email`、`PATCH /users/profile`：更新当前用户信息
- `PATCH /users/avatar`：以内存方式处理 multipart 头像上传
- 提供仅管理员可用的用户列表、更新和删除接口

文件模块：

- 仅管理员可调用的单文件删除和整目录删除接口
- 提供文件与目录的游标分页查询接口

## 运行说明

- 全局守卫通过 `APP_GUARD` 注册，因此默认所有路由都需要鉴权，除非显式使用 `@SkipAuth()`。
- 刷新令牌保存在签名的 httpOnly Cookie 中。生产环境使用 `SameSite=None` 与 `Secure=true`，开发环境使用 `SameSite=Lax`。
- `WorkersModule` 默认已经引入，因此 BullMQ 的 worker 处理器会和主应用跑在同一进程；如果你要拆分独立 worker，需要单独做入口。
- MySQL 备份任务每 12 小时执行一次，并把导出的 SQL 上传到 Cloudflare R2。如果你不希望应用进程内执行备份，需要移除或按环境条件禁用该任务。

## 部署

本地以生产模式运行：

```zsh
pnpm build
APP_PORT=3000 NODE_ENV=production pnpm production
```

通过 PM2 部署：

```zsh
pnpm pm2
pnpm deploy-setup
pnpm deploy
```

## 许可证

MIT
