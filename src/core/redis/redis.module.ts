import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import Redis from "ioredis"
import Redlock from "redlock"

import { REDIS_CLIENT, REDLOCK_CLIENT } from "@/common/constants/redis.constants"
import { RedisService } from "@/core/redis/redis.service"
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>("REDIS_HOST"),
          port: configService.get<number>("REDIS_PORT"),
          password: configService.get<string>("REDIS_PASSWORD"),
          db: configService.get<number>("REDIS_DB"),
          retryStrategy: times => Math.min(times * 50, 2000),
        })
      },
    },
    {
      provide: REDLOCK_CLIENT,
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis) => {
        return new Redlock([redis], {
          driftFactor: 0.01,
          retryCount: 3,
          retryDelay: 200,
          retryJitter: 200,
        })
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT, REDLOCK_CLIENT],
})
export class RedisModule {}
