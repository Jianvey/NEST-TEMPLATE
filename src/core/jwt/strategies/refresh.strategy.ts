import type { Request } from "express"

import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import bcrypt from "bcrypt"
import { Strategy } from "passport-jwt"
import { ExtractJwt } from "passport-jwt"

import type { JWTPayload } from "@/core/jwt/jwt.interface"

import { REFRESH_TOKEN_COOKIE } from "@/common/constants/jwt.constants"
import { CACHE_KEYS } from "@/common/constants/redis-keys.constants"
import { CacheService } from "@/core/cache/cache.service"

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.signedCookies?.[REFRESH_TOKEN_COOKIE] || req?.cookies?.[REFRESH_TOKEN_COOKIE],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET")!,
      passReqToCallback: false,
    })
  }

  async validate(payload: JWTPayload) {
    const userId = payload.sub
    const tokenId = payload.jti
    if (!userId || !tokenId) throw new UnauthorizedException()

    const stored = await this.cache.get<string>(CACHE_KEYS.token.refresh(userId))
    if (!stored) throw new ForbiddenException("Refresh token expired")

    const ok = await bcrypt.compare(tokenId, stored)
    if (!ok) throw new UnauthorizedException("Refresh token invalid")

    return { userId }
  }
}
