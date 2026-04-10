# Nest Template

English | [简体中文](./README.zh_CN.md)

A production-ready NestJS 11 + Express backend template focused on real deployment needs. It includes Prisma, JWT authentication, Redis-backed cache and throttling, BullMQ queues, scheduled tasks, Cloudflare R2 file storage, Resend mail, Winston logging, Swagger, and PM2 deployment.

## Highlights

- NestJS 11 + Express 5 application structure
- Global auth, role guard, validation pipe, response transform, and exception filter
- Prisma 7 with MariaDB adapter and generated enums/types
- JWT access token + signed refresh-token cookie flow
- Cloudflare Turnstile verification on login
- Cloudflare R2 file service with cursor-based list and delete APIs
- Redis cache, throttling, Redlock, and BullMQ integration
- Scheduled MySQL backup task that uploads dumps to R2
- Swagger documentation and Winston daily-rotate logs

## Requirements

- Node >=24.14.0
- pnpm
- MySQL or MariaDB
- Redis
- Cloudflare Turnstile and R2 credentials
- Resend API key for mail delivery
- `mysqldump` available in PATH if you keep the built-in backup task enabled

## Project Layout

```text
src/
	app.module.ts               # global module wiring
	core/                       # bootstrap, config, prisma, jwt, queue, schedule, logger
	common/                     # shared constants, DTOs, guards
	modules/
		auth/                     # auth code/login/refresh/logout
		user/                     # user profile, password, avatar, admin management
		file/                     # R2 file and directory management
	tools/                      # shared utility helpers
```

## Environment Files

The config module loads `.env.${NODE_ENV}` first and then `.env`.

Recommended local setup:

```zsh
cp .env.example .env
cp .env.development.example .env.development
```

Recommended production setup:

```zsh
cp .env.example .env
cp .env.production.example .env.production
```

## Quick Start

```zsh
pnpm install
cp .env.example .env
cp .env.development.example .env.development
pnpm prisma:dev
pnpm start
```

When `SWAGGER_ON=true`, the startup banner prints the full Swagger URL.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm start` | Start the Nest development server with watch mode |
| `pnpm build` | Build the production bundle |
| `pnpm production` | Run the compiled app in production mode |
| `pnpm prisma:dev` | Run Prisma migrate dev and regenerate the client |
| `pnpm prisma:deploy` | Apply Prisma migrations in production |
| `pnpm prisma:reset` | Reset the development database |
| `pnpm type-check` | Run TypeScript type checking against the build config |
| `pnpm lint` | Run ESLint with autofix |
| `pnpm prettier` | Format the repository |
| `pnpm pm2` | Start or restart with `pm2.config.json` |
| `pnpm deploy-setup` | Prepare the remote PM2 deployment target |
| `pnpm deploy` | Force a PM2 deploy |
| `pnpm commit` | Open the conventional-commit prompt |
| `pnpm husky-install` | Recreate Husky hooks |

## Key Configuration

Environment variables are validated in `src/core/config/config.config.ts`.

Application:

- `APP_NAME`
- `APP_PORT`
- `APP_PREFIX`
- `APP_VERSION`
- `NODE_ENV`

Swagger:

- `SWAGGER_ON`
- `SWAGGER_PATH`
- `SWAGGER_TITLE`
- `SWAGGER_DESCRIPTION`
- `SWAGGER_VERSION`

Security and auth:

- `COOKIE_SECRET`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `CLOUDFLARE_TURNSTILE_SECRET`

Storage:

- `ASSETS_PREFIX`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY`
- `CLOUDFLARE_R2_SECRET_KEY`
- `CLOUDFLARE_R2_BUCKET_NAME`
- `CLOUDFLARE_R2_ENDPOINT`

Database and Redis:

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

Mail:

- `MAIL_API_KEY`
- `MAIL_FROM`

Use `.env.example`, `.env.development.example`, and `.env.production.example` as the source of truth for concrete values.

## Included Modules

Auth module:

- `POST /auth/code`: send a verification code for login, registration, reset, or contact updates
- `POST /auth/login`: email + password + 6-digit code + Turnstile token
- `POST /auth/refresh`: rotate refresh token and return a new access token
- `POST /auth/logout`: revoke the current login session

User module:

- `POST /users/`: create a user
- `GET /users/profile`: get current user profile
- `PATCH /users/password`, `PATCH /users/email`, `PATCH /users/profile`: update current user data
- `PATCH /users/avatar`: upload avatar with in-memory multipart handling
- Admin-only routes for listing, updating, and deleting users

File module:

- Admin-only delete endpoints for a single file or a full directory in R2
- Cursor-based file and directory listing endpoints

## Runtime Notes

- Global guards are enabled through `APP_GUARD`, so routes are authenticated by default unless they use `@SkipAuth()`.
- Refresh tokens are stored in a signed, httpOnly cookie. In production the cookie uses `SameSite=None` and `Secure=true`; in development it uses `SameSite=Lax`.
- `WorkersModule` is imported by default, so BullMQ worker processors run inside the main application process unless you split them into a separate entry.
- The MySQL backup task runs every 12 hours and uploads the dump to Cloudflare R2. If you do not want in-process backups, remove or conditionally disable that scheduled task.

## Deployment

Run locally in production mode:

```zsh
pnpm build
APP_PORT=3000 NODE_ENV=production pnpm production
```

Deploy with PM2:

```zsh
pnpm pm2
pnpm deploy-setup
pnpm deploy
```

## License

MIT
