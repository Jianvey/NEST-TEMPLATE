import type { Request, Response } from "express"

import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { isEmail, isPhoneNumber } from "class-validator"

import { REFRESH_TOKEN_COOKIE } from "@/common/constants/jwt.constants"
import { BaseResponseType } from "@/common/dto/response/base.response"
import { TurnstileGuard } from "@/common/guards/turnstile.guard"
import { SkipAuth } from "@/core/jwt/decorators/skip-auth.decorator"
import { RefreshAuthGuard } from "@/core/jwt/guards/refresh-auth.guard"
import { getRefreshTokenCookieOptions } from "@/core/jwt/jwt.config"
import { JwtService } from "@/core/jwt/jwt.service"
import { AuthService } from "@/modules/auth/auth.service"
import { AuthCodeDto, AuthCodeScene } from "@/modules/auth/dto/code.dto"
import { AuthLoginDto } from "@/modules/auth/dto/login.dto"
import { AuthLoginEntity } from "@/modules/auth/entities/login.entity"
import { AuthRefreshEntity } from "@/modules/auth/entities/refresh.entity"
import { UserService } from "@/modules/user/user.service"

@Controller("/auth")
@ApiTags("认证模块")
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  private getRefreshCookieOptions() {
    return getRefreshTokenCookieOptions(this.configService, this.configService.get<number>("JWT_REFRESH_EXPIRES_IN"))
  }

  @Post("/code")
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  @ApiOperation({ summary: "发送验证码" })
  @ApiOkResponse({ description: "Success", type: BaseResponseType(String) })
  async code(@Body() dto: AuthCodeDto) {
    if (dto.scene === AuthCodeScene.UPDATE_PHONE) {
      if (!isPhoneNumber(dto.contact, "CN")) throw new BadRequestException("Invalid phone number format")
    } else {
      if (!isEmail(dto.contact)) throw new BadRequestException("Invalid email format")
    }

    return { data: await this.authService.code(dto) }
  }

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  @UseGuards(TurnstileGuard)
  @ApiOperation({ summary: "登录" })
  @ApiOkResponse({ description: "Success", type: BaseResponseType(AuthLoginEntity) })
  async login(@Body() dto: AuthLoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.login(dto)
    const tokens = await this.jwtService.createTokens(user.userId, user.role)

    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, this.getRefreshCookieOptions())
    return { data: { user, token: tokens.accessToken } }
  }

  @Post("/refresh")
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshAuthGuard)
  @SkipAuth()
  @ApiOperation({ summary: "刷新令牌" })
  @ApiOkResponse({ description: "Success", type: BaseResponseType(AuthRefreshEntity) })
  @ApiBearerAuth()
  @ApiCookieAuth()
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = await this.userService.getUser(req.user!.userId)
    const tokens = await this.jwtService.rotateRefresh(user.userId, user.role)

    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, this.getRefreshCookieOptions())

    return { data: { token: tokens.accessToken } }
  }

  @Post("/logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "登出" })
  @ApiOkResponse({ description: "Success", type: BaseResponseType() })
  @ApiBearerAuth()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.jwtService.revokeTokens(req.user!.userId, req.user!.jti)

    res.clearCookie(REFRESH_TOKEN_COOKIE, getRefreshTokenCookieOptions(this.configService))
  }
}
