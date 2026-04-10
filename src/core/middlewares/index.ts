import { NestExpressApplication } from "@nestjs/platform-express"

import { traceIdMiddleware } from "@/core/middlewares/trace-id.middleware"

export function setupMiddlewares(app: NestExpressApplication) {
  app.use(traceIdMiddleware)
}
