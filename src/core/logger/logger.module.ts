import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { WinstonModule } from "nest-winston"

import { createWinstonLoggerOptions } from "@/core/logger/logger.config"
import { LoggerService } from "@/core/logger/logger.service"

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => createWinstonLoggerOptions(configService),
    }),
  ],
  providers: [LoggerService],
  exports: [WinstonModule, LoggerService],
})
export class LoggerModule {}
