import { Module } from "@nestjs/common"
import { ConfigModule as Config } from "@nestjs/config"

import { validationSchema } from "@/core/config/config.config"

@Module({
  imports: [
    Config.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? "development"}`, ".env"],
      expandVariables: true,
      validationSchema,
    }),
  ],
})
export class ConfigModule {}
