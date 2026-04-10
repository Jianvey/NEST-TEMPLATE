import { BullModule } from "@nestjs/bullmq"
import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        prefix: config.get<string>("APP_NAME"),
        connection: {
          host: config.get<string>("REDIS_HOST"),
          port: config.get<number>("REDIS_PORT"),
          password: config.get<string>("REDIS_PASSWORD"),
          db: config.get<number>("REDIS_DB"),
        },
      }),
    }),
    BullModule.registerQueue({ name: "mail" }),
    BullModule.registerQueue({ name: "image" }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
