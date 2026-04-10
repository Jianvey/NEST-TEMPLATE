import { createKeyv } from "@keyv/redis"
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager"
import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { CacheService } from "@/core/cache/cache.service"

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>("REDIS_URL")

        return {
          ttl: configService.get<number>("REDIS_CACHE_TTL"),
          stores: [
            createKeyv(
              { url: redisUrl },
              { namespace: configService.get<string>("APP_NAME"), keyPrefixSeparator: ":" },
            ),
          ],
        }
      },
      isGlobal: true,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
