import type { NestExpressApplication } from "@nestjs/platform-express"

import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import chalk from "chalk"

import { AppModule } from "@/app.module"
import bootstrap from "@/core/bootstrap"

async function launch() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ["warn", "error", "fatal"] })
    const configService = app.get(ConfigService)

    bootstrap(app, configService)
    await app.listen(configService.get<number>("APP_PORT")!, "0.0.0.0")

    const url = await app.getUrl()
    const APP_NAME = chalk.green(configService.get<string>("APP_NAME"))
    const NODE_ENV = chalk.yellow(configService.get<string>("NODE_ENV")?.toLocaleUpperCase())
    const SWAGGER_VERSION = chalk.cyan(`v${configService.get<string>("SWAGGER_VERSION")}`)
    const ADDRESS = chalk.magenta(url)
    const SWAGGER_ON = configService.get<boolean>("SWAGGER_ON")
    const SWAGGER_PATH = chalk.blue(`${url}${configService.get<string>("SWAGGER_PATH")}`)

    console.log(`🚀 [${APP_NAME}] ${NODE_ENV} ${SWAGGER_VERSION} ${SWAGGER_ON ? SWAGGER_PATH : ADDRESS}`)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ Failed to start server: ${message}`)
  }
}

void launch()
