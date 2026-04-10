import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common"
import Redis from "ioredis"

import { REDIS_CLIENT } from "@/common/constants/redis.constants"

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleDestroy() {
    await this.redis.quit()
  }

  async get(key: string) {
    return await this.redis.get(key)
  }

  async set(key: string, value: string | number | Buffer, ttl?: number): Promise<void> {
    if (ttl) await this.redis.set(key, value, "PX", ttl)
    else await this.redis.set(key, value)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key)
    return result > 0
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }
}
