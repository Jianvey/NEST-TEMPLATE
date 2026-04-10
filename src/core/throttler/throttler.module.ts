import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis"
import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerGuard, ThrottlerModule as NestThrottlerModule } from "@nestjs/throttler"

@Global()
@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>("THROTTLE_TTL")!,
            limit: configService.get<number>("THROTTLE_LIMIT")!,
            storage: new ThrottlerStorageRedisService(configService.get<string>("REDIS_URL")),
          },
        ],
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class ThrottlerModule {}
