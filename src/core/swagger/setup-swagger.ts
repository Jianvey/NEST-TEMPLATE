import type { NestExpressApplication } from "@nestjs/platform-express"

import { ConfigService } from "@nestjs/config"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export function setupSwagger(app: NestExpressApplication, configService: ConfigService) {
  if (configService.get<boolean>("SWAGGER_ON")) {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>("SWAGGER_TITLE")!)
      .setDescription(configService.get<string>("SWAGGER_DESCRIPTION")!)
      .setVersion(configService.get<string>("SWAGGER_VERSION")!)
      .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", name: "Authorization" })
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(configService.get<string>("SWAGGER_PATH")!, app, document, {
      swaggerOptions: { persistAuthorization: true },
    })
  }
}
