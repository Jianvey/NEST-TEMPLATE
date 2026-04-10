# Copilot Instructions for Nest Template

This repository is a NestJS 11 + Express template optimized for production: structured modules, Prisma ORM, JWT auth, BullMQ queues, Redis-backed cache/throttling, Winston logging, PM2 deploy, Swagger docs, and mail via Resend.

## Architecture Overview
- **Entry & Bootstrap:** `src/main.ts` creates a `NestExpressApplication`, then runs `src/core/bootstrap.ts` to configure global prefix, URI versioning, CORS, shutdown hooks, Swagger, Express plugins, and Express middlewares.
- **Global Concerns:**
  - Global guards/interceptors/pipes/filters are registered via `APP_GUARD`/`APP_INTERCEPTOR`/`APP_PIPE`/`APP_FILTER` providers in `src/app.module.ts`.
  - Express plugins are registered in `src/core/express/setup-express-plugins.ts` (helmet, compression, cookie-parser).
  - Express middlewares are registered in `src/core/middlewares/*` and wired by `src/core/middlewares/index.ts`.
  - Logger: `src/core/logger/*` wires `winston` with daily rotate file to `logs/**`.
  - Config: `src/core/config/*` centralizes env config; `ConfigService` is available everywhere.
  - Swagger: `src/core/swagger/setup-swagger.ts` with `SWAGGER_ON`, version, and path from config.
- **Security (JWT):** `src/core/jwt/*` provides JWT service, strategies (`jwt.strategy.ts`, `refresh.strategy.ts`), guards (`jwt-auth.guard.ts`, `refresh-auth.guard.ts`, `roles.guard.ts`), and decorators (`skip-auth.decorator.ts`, `roles.decorator.ts`). Use `@SkipAuth()` for open routes; `@Roles('admin')` for RBAC.
- **Persistence (Prisma):** `src/core/prisma/*` exposes `PrismaService` and schema in `schema.prisma` with generated types under `generators/`. Prefer repository pattern where present (e.g., `modules/user/user.repository.ts`).
- **Queues:** BullMQ via `src/core/queue/*` with processors/workers in `src/core/queue/processors` and `workers.module.ts`.
- **Schedule/Tasks:** `src/core/schedule/*` enables cron jobs; task services live under `src/core/schedule/tasks/**`.
- **Mail:** `src/core/mail/*` integrates Resend; templates in `templates/*.hbs`.
- **Cache/Throttle:** `src/core/cache/*` and `src/core/throttler/*` use Redis (`@keyv/redis`, `@nest-lab/throttler-storage-redis`); shared keys/constants in `src/common/constants/redis-keys.constants.ts` and `src/common/constants/redis.constants.ts`.
- **Modules:** Feature modules in `src/modules/**` follow Nest conventions: controller, service, DTOs, entities. Examples: `auth`, `user`, `file`.
- **Uploads:** Files under `uploads/` (e.g., `uploads/avatars/`). Serve static paths via Express if needed.
- **File Uploads (R2):** `src/modules/file/*` handles upload/delete to Cloudflare R2 via `FileService` (S3-compatible). Returned URLs are prefixed by `ASSETS_PREFIX`.
- **Backup Task (MySQL → R2):** `src/core/schedule/tasks/backup.service.ts` runs `mysqldump`, writes to `temp/`, then uploads to R2 via `FileService` and cleans up the temp file.

## Developer Workflows
- **Requirements:** Node `>=22.20.0`, pnpm recommended.
- **Install & Dev:**
  ```zsh
  pnpm install
  pnpm prisma:dev   # migrate dev + generate client
  pnpm start        # nest start --watch (Express)
  ```
- **Build & Run (prod locally):**
  ```zsh
  pnpm build
  APP_PORT=3000 NODE_ENV=production pnpm production
  ```
- **Deploy via PM2:**
  ```zsh
  pnpm pm2                  # start or restart using pm2.config.json
  pnpm deploy-setup         # first-time remote setup
  pnpm deploy               # deploy to production
  ```
- **Prisma (production):** `pnpm prisma:deploy` applies migrations in production.
- **Lint & Format:** `pnpm prettier` then `pnpm lint`. Type check: `pnpm type-check`.
- **Conventional Commits:** `pnpm commit` (commitizen + commitlint). Husky hooks: run `pnpm husky-install` once.

## Project Conventions & Patterns
- **Express-first:** Use Express plugins via `setup-express-plugins.ts`; avoid Fastify-specific APIs.
- **Global pipeline:** Prefer global providers in `app.module.ts` (`APP_GUARD`/`APP_PIPE`/`APP_INTERCEPTOR`/`APP_FILTER`) over per-route wiring unless necessary.
- **Auth:**
  - Protect routes with the global `JwtAuthGuard` + `RolesGuard`.
  - Public routes must use `@SkipAuth()` (`src/core/jwt/decorators/skip-auth.decorator.ts`).
  - Role checks via `@Roles(...)` + `RolesGuard`.
  - Tokens/refresh handled by `core/jwt` strategies and service.
- **DTOs & Transform:** Shared DTO bases under `src/common/dto/{query,response}`; responses shaped by `transform-response.interceptor.ts`.
- **Repositories:** Prefer repository or service-layer calls to `PrismaService`. Example: `modules/user/user.repository.ts` encapsulates queries.
- **Caching:** Use `CacheService` (`src/core/cache/cache.service.ts`) with keys/constants from `src/common/constants/redis-keys.constants.ts`.
- **Queues:** Add processors under `src/core/queue/processors` and register in `workers.module.ts`.
- **Mail:** Use `MailService` and handlebars templates in `templates/`.
- **Swagger:** Respect `SWAGGER_ON`, `SWAGGER_VERSION`, `SWAGGER_PATH` from config; annotate controllers for API docs.
- **Logging:** Use `LoggerService` (`src/core/logger/logger.service.ts`) or Nest `Logger` backed by Winston.
- **File Service:** Use `FileService.uploadFile(buffer|multerFile, path, mimetype)` for uploads. Prefer generating deterministic paths like `uploads/avatars/{userId}.png`.

## Integration Points & Config
- **ConfigService:** Read `APP_NAME`, `APP_PORT`, `APP_PREFIX`, `APP_VERSION`, `NODE_ENV`, `SWAGGER_*` from env; source in `src/core/config/config.config.ts`.
- **JWT:** `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` drive strategies in `src/core/jwt/*`.
- **Redis:** `REDIS_URL` required for cache/throttler. Cache service in `src/core/cache/cache.service.ts`; throttler config in `src/core/throttler/*`.
- **Prisma:** Schema `src/core/prisma/schema.prisma`; migrations `src/core/prisma/migrations/**`. Use `pnpm prisma:dev` locally and `pnpm prisma:deploy` in production.
- **Mail (Resend):** Configure keys in env used by `src/core/mail/*`; templates under `src/core/mail/templates/*.hbs`.
- **Static/Uploads:** Serve `uploads/**` (e.g., `uploads/avatars/`) via Express static middleware if needed.
- **Database (MySQL):** `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` used by backup task.
- **Cloudflare R2:** `CLOUDFLARE_R2_ENDPOINT`, `CLOUDFLARE_R2_ACCESS_KEY`, `CLOUDFLARE_R2_SECRET_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `ASSETS_PREFIX` used by `FileService`.
- **Uploads (Local):** `uploads/**` is for local/static files; if serving statically, register Express static middleware and align `ASSETS_PREFIX` to public URL.

## Examples
- **Public health route:**
  ```ts
  @SkipAuth()
  @Get('health')
  getHealth() { return { ok: true } }
  ```
- **Role-protected endpoint:**
  ```ts
  @Roles('admin')
  @Get('admin/users')
  list() { return this.userService.listAdmins() }
  ```
- **Prisma via repository:**
  ```ts
  // modules/user/user.repository.ts
  this.prisma.user.findMany({ where: { active: true } })
  ```

## Tips for Productivity
- Prefer injecting `PrismaService`, `JwtService`, `CacheService`, `MailService`, `LoggerService` from their modules.
- Put cross-cutting components under `src/common/**` or `src/core/**` rather than module folders.
- Keep uploads in `uploads/**` and expose via Express static as needed.

Note: For method/controller-scoped usage (e.g. `@UseGuards(TurnstileGuard)`), Nest may register the guard as a module injectable during metadata scanning, so explicit `providers: [TurnstileGuard]` can be optional. Prefer explicit registration when you need global usage (`APP_GUARD`), cross-module reuse, or manual resolution (e.g. `moduleRef.get(TurnstileGuard)`).


