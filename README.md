# Nest Template (NestJS + Express)

A production-ready backend template with NestJS and Express. Includes Prisma ORM, JWT auth, BullMQ queues, Redis-backed cache/throttling, Winston logging, PM2 deploy, Swagger docs, and Resend mail.

## Features
- Express-first, global pipelines (guards/interceptors/pipes/filters)
- JWT access/refresh with role-based guard and decorators
- Prisma schema and generated client with repository pattern
- BullMQ queues with processors/workers
- Redis cache + throttler storage
- Winston logger with daily rotate to `logs/**`
- Swagger with URI versioning and global prefix support
- File uploads (support ready)

## Requirements
- Node `>=22.20.0`
- pnpm recommended
- Redis for cache/throttler
- Database supported by Prisma (see `src/core/prisma/schema.prisma`)

## Quick Start
```zsh
pnpm install
pnpm prisma:dev   # migrate dev + generate Prisma client
pnpm start        # start dev server (Express)
```

Visit Swagger: shown in the startup banner if `SWAGGER_ON=true`.

## Build & Run (Production Locally)
```zsh
pnpm build
APP_PORT=3000 NODE_ENV=production pnpm production
```

## PM2 Deployment
```zsh
pnpm pm2                  # start or restart using pm2.config.json
pnpm deploy-setup         # initial remote setup
pnpm deploy               # deploy to production
```

## Scripts
- `pnpm prisma:dev`: `prisma migrate dev && prisma generate`
- `pnpm prisma:deploy`: apply migrations in production
- `pnpm type-check`: `tsc --noEmit`
- `pnpm prettier` then `pnpm lint`
- `pnpm commit`: conventional commits via commitizen
- `pnpm husky-install`: set up pre-commit & commit-msg hooks

## Configuration
Centralized in `src/core/config/config.config.ts` via `ConfigService`.

Environment variables (examples):
- `APP_NAME` (e.g., `NestTemplate`)
- `APP_PORT` (default in `.env`)
- `APP_PREFIX` (optional, e.g., `/api`)
- `APP_VERSION` (e.g., `1` or `1,2`) for URI versioning
- `NODE_ENV` (`development` | `production`)
- `SWAGGER_ON` (`true|false`), `SWAGGER_VERSION` (e.g., `1`), `SWAGGER_PATH` (e.g., `/docs`)
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- `REDIS_URL` for cache/throttler
- Resend mail vars (see `src/core/mail/*`)

## Architecture
- Entry: `src/main.ts` creates `NestExpressApplication` and runs `src/core/bootstrap.ts`
- Bootstrap sets global prefix, URI versioning, CORS, shutdown hooks, Express plugins, Swagger, and Express middlewares
- Global guards/interceptors/pipes/filters are registered via `APP_GUARD`/`APP_INTERCEPTOR`/`APP_PIPE`/`APP_FILTER` providers in `src/app.module.ts`
- Modules under `src/modules/**` (e.g., `auth`, `user`, `file`) follow Nest patterns (controller, service, DTOs, entities)
- Prisma: `src/core/prisma/schema.prisma` with generated types in `generators/`; prefer repository layer (e.g., `modules/user/user.repository.ts`)
- JWT: strategies, guards, decorators in `src/core/jwt/*` (`@SkipAuth()`, `@Roles('admin')`)
- Queues: `src/core/queue/*` with processors in `processors/` and `workers.module.ts`
- Logging: `src/core/logger/*`, outputs to `logs/**`

## Usage Examples
```ts
// Public health route
@SkipAuth()
@Get('health')
getHealth() { return { ok: true } }

// Role-protected endpoint
@Roles('admin')
@Get('admin/users')
list() { return this.userService.listAdmins() }

// Prisma via repository
// modules/user/user.repository.ts
this.prisma.user.findMany({ where: { active: true } })
```

## Development Conventions
- Express adapters/middleware only; avoid Fastify APIs
- Rely on global pipeline providers from `src/app.module.ts`; minimize per-route duplication
- Use shared DTO bases in `src/common/dto/{query,response}`; responses shaped by `transform-response.interceptor.ts`
- Cache via `CacheService` with keys from `src/common/constants/redis-keys.constants.ts`
- Add BullMQ processors under `src/core/queue/processors` and register in `workers.module.ts`
- Mail via `MailService` and templates in `src/core/mail/templates/*.hbs`

### Workers
`WorkersModule` registers BullMQ `WorkerHost` processors. If you want to run workers in a separate process, remove `WorkersModule` from `AppModule` and create a dedicated worker entry (or conditional import by env).

## License
MIT
