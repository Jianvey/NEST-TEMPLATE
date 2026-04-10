import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService as NestJwtService } from "@nestjs/jwt"
import bcrypt from "bcrypt"
import { randomUUID } from "crypto"

import type { JWTPayload } from "@/core/jwt/jwt.interface"

import { BCRYPT_SALT_ROUNDS } from "@/common/constants/bcrypt.constants"
import { CACHE_KEYS } from "@/common/constants/redis-keys.constants"
import { CacheService } from "@/core/cache/cache.service"
import { Role } from "@/core/prisma/generators/enums"

@Injectable()
export class JwtService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: NestJwtService,
    private readonly cache: CacheService,
  ) {}

  async createTokens(userId: string, role: Role) {
    const JWT_ACCESS_EXPIRES_IN = this.configService.get<number>("JWT_ACCESS_EXPIRES_IN")!
    const JWT_REFRESH_EXPIRES_IN = this.configService.get<number>("JWT_REFRESH_EXPIRES_IN")!

    const accessJti = randomUUID()
    const accessPayload = { sub: userId, role, jti: accessJti }
    const accessToken = await this.jwtService.signAsync<JWTPayload>(accessPayload, {
      expiresIn: JWT_ACCESS_EXPIRES_IN / 1000,
    })

    const refreshJti = randomUUID()
    const refreshPayload = { sub: userId, jti: refreshJti }
    const refreshToken = await this.jwtService.signAsync<JWTPayload>(refreshPayload, {
      expiresIn: JWT_REFRESH_EXPIRES_IN / 1000,
    })

    const hashed = await bcrypt.hash(refreshJti, BCRYPT_SALT_ROUNDS)
    await this.cache.set(CACHE_KEYS.token.refresh(userId), hashed, JWT_REFRESH_EXPIRES_IN)

    return { accessToken, refreshToken, accessJti, refreshJti }
  }

  async rotateRefresh(userId: string, role: Role) {
    await this.revokeTokens(userId)
    return this.createTokens(userId, role)
  }

  async revokeTokens(userId: string, accessJti?: string) {
    if (accessJti) {
      const JWT_ACCESS_EXPIRES_IN = this.configService.get<number>("JWT_ACCESS_EXPIRES_IN")!
      await this.cache.set(CACHE_KEYS.token.blockedAccess(accessJti), "1", JWT_ACCESS_EXPIRES_IN)
    }

    await this.cache.delete(CACHE_KEYS.token.refresh(userId))
  }
}
