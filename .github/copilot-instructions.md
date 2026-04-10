# Copilot Instructions for Nest Template

This repository is a production-oriented NestJS 11 + Express 5 backend template. It uses Prisma 7, JWT auth, Redis-backed cache/throttling/locks, BullMQ workers, scheduled tasks, Cloudflare R2 file storage, Resend mail, Swagger, Winston logging, and PM2 deployment.

## Architecture Overview
- **Entry and bootstrap:** `src/main.ts` creates the `NestExpressApplication`, resolves `ConfigService`, calls `src/core/bootstrap.ts`, then listens on `APP_PORT`. The startup banner prints the Swagger URL when Swagger is enabled.
- **Config loading:** `src/core/config/config.module.ts` loads `.env.${NODE_ENV}` first and then `.env`, with variable expansion and Joi validation from `src/core/config/config.config.ts`.
- **Global pipeline:** `src/app.module.ts` registers `JwtAuthGuard`, `RolesGuard`, `GlobalValidationPipe`, `TransformResponseInterceptor`, and `CatchExceptionFilter` via `APP_*` providers.
- **Express layer:** Express plugins live in `src/core/express/setup-express-plugins.ts`; Express middlewares are wired from `src/core/middlewares/index.ts`.
- **Persistence:** Prisma schema and migrations live under `src/core/prisma`; generated artifacts are under `src/core/prisma/generators`. Prefer repository/service-layer access over controller-level Prisma queries.
- **Queues and workers:** Queue infrastructure lives in `src/core/queue`. `WorkersModule` registers `MailProcessor` and `ImageProcessor`, so worker processors run inside the main application process unless you deliberately split them into a separate entry.
- **Schedule:** Cron jobs live under `src/core/schedule/tasks`. `backup.service.ts` runs `mysqldump`, writes into `temp/`, uploads to R2 via `FileService`, and cleans up the temporary file.
- **Storage:** `src/modules/file/file.service.ts` is the S3-compatible R2 integration. File URLs are composed from `ASSETS_PREFIX`, so treat R2 as the default file storage path instead of assuming local static uploads.
- **Mail, cache, logger:** Mail is implemented in `src/core/mail`, cache in `src/core/cache`, throttling in `src/core/throttler`, Redis integration in `src/core/redis`, and Winston logging in `src/core/logger`.

## Developer Workflows
- **Requirements:** Node `>=24.14.0`, pnpm, MySQL or MariaDB, Redis, Cloudflare credentials, and `mysqldump` if the scheduled backup remains enabled.
- **Install and dev:**
  ```zsh
  pnpm install
  cp .env.example .env
  cp .env.development.example .env.development
  pnpm prisma:dev
  pnpm start
  ```
- **Build and run locally in production:**
  ```zsh
  pnpm build
  APP_PORT=3000 NODE_ENV=production pnpm production
  ```
- **Deploy via PM2:**
  ```zsh
  pnpm pm2
  pnpm deploy-setup
  pnpm deploy
  ```
- **Prisma:** Use `pnpm prisma:dev` for local schema changes, `pnpm prisma:deploy` for production deploys, and `pnpm prisma:reset` only for development resets.
- **Quality checks:** Use `pnpm type-check`, `pnpm lint`, and `pnpm prettier`.

## Project Conventions and Patterns
- **Use the `@/*` import alias:** Prefer `@/core/...` over deep relative paths.
- **Express-first:** Use Express middleware/plugins; avoid Fastify-specific APIs.
- **Auth is default-on:** Because auth guards are global, public endpoints must explicitly use `@SkipAuth()`.
- **Roles:** Use `@Roles(...)` with the generated `Role` enum from `src/core/prisma/generators/enums`.
- **Refresh tokens:** Refresh tokens are stored in a signed, httpOnly cookie. Cookie behavior is defined in `src/core/jwt/jwt.config.ts`; keep that file in sync if auth flow or frontend host assumptions change.
- **Turnstile:** Login is protected by `TurnstileGuard` with method-scoped `@UseGuards(TurnstileGuard)`. Keep that requirement intact unless the auth design is intentionally changing.
- **Response shape:** Controllers typically return `{ data }`, and response normalization happens through `TransformResponseInterceptor`. Reuse shared DTO/response factories under `src/common/dto`.
- **Repositories:** Prefer repository or service methods that use Prisma `select` where practical instead of broad `find*` reads that overfetch data.
- **Queues:** Add new processors under `src/core/queue/processors` and register them in `src/core/queue/workers.module.ts`.
- **Files:** Use `FileService.uploadFile`, `downloadFile`, `deleteFile`, and cursor-list helpers for R2 operations. Prefer deterministic object keys such as `uploads/avatars/{userId}.png`.
- **URLs:** Do not use filesystem join helpers to compose public asset URLs. Use the existing URL helper in `src/tools/url`.
- **Docs and env sync:** If you change env variables or startup behavior, update `src/core/config/config.config.ts`, `.env.example`, `.env.development.example`, `.env.production.example`, `README.md`, and `README.zh_CN.md` together.

## Integration Points and Config
- **Application config:** `APP_NAME`, `APP_PORT`, `APP_PREFIX`, `APP_VERSION`, `NODE_ENV`
- **Swagger:** `SWAGGER_ON`, `SWAGGER_PATH`, `SWAGGER_TITLE`, `SWAGGER_DESCRIPTION`, `SWAGGER_VERSION`
- **Auth and cookies:** `COOKIE_SECRET`, `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `CLOUDFLARE_TURNSTILE_SECRET`
- **Storage:** `ASSETS_PREFIX`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY`, `CLOUDFLARE_R2_SECRET_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_ENDPOINT`
- **Throttle and cache:** `THROTTLE_TTL`, `THROTTLE_LIMIT`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_CACHE_TTL`, `REDIS_URL`
- **Database:** `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_URL`
- **Mail:** `MAIL_API_KEY`, `MAIL_FROM`
- Do not invent retired env names such as `JWT_REFRESH_SECRET` or `JWT_EXPIRES_IN`; use the validated names from `config.config.ts`.

## Examples
- **Public route:**
  ```ts
  @SkipAuth()
  @Post("/login")
  @UseGuards(TurnstileGuard)
  async login() {
    return { data: "ok" }
  }
  ```
- **Admin-only route:**
  ```ts
  @Roles(Role.ADMIN)
  @Delete("/directory")
  async deleteDirectory() {
    return { data: true }
  }
  ```
- **Repository-style Prisma access:**
  ```ts
  return this.prisma.user.findMany({
    select: { userId: true, email: true, role: true },
  })
  ```

## Productivity Notes
- Prefer injecting framework services from their modules instead of creating ad-hoc clients.
- Put cross-cutting infrastructure under `src/core` or `src/common`, not inside feature modules.
- If you change worker behavior, backup scheduling, or auth cookies, verify the surrounding runtime assumptions instead of patching a single file in isolation.
- For local development, frontend and API should use the same site host (`localhost` with `localhost`, or `127.0.0.1` with `127.0.0.1`) if you expect refresh-token cookies to be sent.

Note: For method-scoped guard usage such as `@UseGuards(TurnstileGuard)`, Nest can resolve the injectable during metadata scanning even if it is not explicitly listed in the feature module providers. Add explicit provider registration when you need global usage, cross-module reuse, or manual resolution.


