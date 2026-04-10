import type { CookieOptions } from "express"

import { ConfigService } from "@nestjs/config"

export function getRefreshTokenCookieOptions(configService: ConfigService, maxAge?: number): CookieOptions {
  const IS_PRODUCTION = configService.get<string>("NODE_ENV") === "production"

  return {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "none" : "lax",
    path: "/",
    signed: true,
    maxAge,
  }
}
