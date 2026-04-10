import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtModule as NestJwtModule } from "@nestjs/jwt"

import { JwtService } from "@/core/jwt/jwt.service"
import { JwtStrategy } from "@/core/jwt/strategies/jwt.strategy"
import { RefreshStrategy } from "@/core/jwt/strategies/refresh.strategy"

@Module({
  imports: [
    NestJwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ secret: configService.get<string>("JWT_SECRET")! }),
    }),
  ],
  providers: [JwtStrategy, RefreshStrategy, JwtService],
  exports: [NestJwtModule, JwtService],
})
export class JwtModule {}
