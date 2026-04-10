import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable } from "@nestjs/common"
import { type Cache } from "cache-manager"

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T = unknown>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key)
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl)
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }
}
