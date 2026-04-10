import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { type Request } from "express"
import { ExtractJwt, Strategy } from "passport-jwt"

import type { JWTPayload } from "@/core/jwt/jwt.interface"

import { CACHE_KEYS } from "@/common/constants/redis-keys.constants"
import { CacheService } from "@/core/cache/cache.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET")!,
      passReqToCallback: false,
    })
  }

  async validate(payload: JWTPayload): Promise<Request["user"]> {
    if (!payload.jti) throw new UnauthorizedException("Invalid token")

    const blocked = await this.cache.get<string>(CACHE_KEYS.token.blockedAccess(payload.jti))
    if (blocked) throw new UnauthorizedException("Token revoked")

    return { jti: payload.jti, userId: payload.sub, role: payload.role! }
  }
}
