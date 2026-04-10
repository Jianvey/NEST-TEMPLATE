import type { NestExpressApplication } from "@nestjs/platform-express"

import { VERSION_NEUTRAL, VersioningType } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { setupExpressPlugins } from "@/core/express/setup-express-plugins"
import { setupMiddlewares } from "@/core/middlewares"
import { setupSwagger } from "@/core/swagger/setup-swagger"

export default function bootstrap(app: NestExpressApplication, configService: ConfigService) {
  const APP_PREFIX = configService.get<string>("APP_PREFIX")
  if (APP_PREFIX) app.setGlobalPrefix(APP_PREFIX)

  const APP_VERSION = configService.get<string>("APP_VERSION")
  const VERSION = APP_VERSION ? APP_VERSION.split(",") : VERSION_NEUTRAL
  if (VERSION) app.enableVersioning({ type: VersioningType.URI, defaultVersion: VERSION })

  app.enableCors({ origin: true, credentials: true, exposedHeaders: ["x-trace-id"] })
  app.enableShutdownHooks()

  setupExpressPlugins(app, configService)
  setupSwagger(app, configService)
  setupMiddlewares(app)
}
