import type { ConfigService } from "@nestjs/config"
import type { NestExpressApplication } from "@nestjs/platform-express"

import compression from "compression"
import cookieParser from "cookie-parser"
import helmet from "helmet"

export function setupExpressPlugins(app: NestExpressApplication, config: ConfigService) {
  app.use(helmet())

  app.use(compression())

  app.use(cookieParser(config.get<string>("COOKIE_SECRET")))
}
