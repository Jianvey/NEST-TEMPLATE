import { BadRequestException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import bcrypt from "bcrypt"
import { plainToInstance } from "class-transformer"

import { CACHE_KEYS } from "@/common/constants/redis-keys.constants"
import { CACHE_TTL } from "@/common/constants/redis.constants"
import { CacheService } from "@/core/cache/cache.service"
import { MailService } from "@/core/mail/mail.service"
import { AuthCodeDto, AuthCodeScene } from "@/modules/auth/dto/code.dto"
import { AuthLoginDto } from "@/modules/auth/dto/login.dto"
import { UserEntity } from "@/modules/user/entities/user.entity"
import { UserRepository } from "@/modules/user/user.repository"
import { generateCode } from "@/tools/number"

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cache: CacheService,
    private readonly mailService: MailService,
    private readonly userRepo: UserRepository,
  ) {}

  private getCodeSubject(scene: AuthCodeScene, appName: string) {
    switch (scene) {
      case AuthCodeScene.LOGIN:
        return `${appName} login verification code`
      case AuthCodeScene.REGISTER:
        return `${appName} registration verification code`
      case AuthCodeScene.RESET_PASSWORD:
        return `${appName} password reset verification code`
      case AuthCodeScene.UPDATE_EMAIL:
        return `${appName} email update verification code`
      default:
        return `${appName} verification code`
    }
  }

  async code({ scene, contact }: AuthCodeDto) {
    const CACHE_KEY = CACHE_KEYS.auth.code(scene, contact)
    const APP_NAME = this.configService.get<string>("APP_NAME")!
    const YEAR = new Date().getFullYear()
    const CODE = generateCode()

    if (scene === AuthCodeScene.UPDATE_PHONE) {
      throw new BadRequestException("Phone verification is not supported yet")
    }

    if (await this.cache.get(CACHE_KEY)) {
      throw new BadRequestException("A code has already been sent recently. Please wait before requesting a new one.")
    }

    const data = await this.mailService.send({
      to: contact,
      subject: this.getCodeSubject(scene, APP_NAME),
      template: "verification-code",
      variables: {
        appName: APP_NAME,
        username: contact,
        code: CODE,
        expire: CACHE_TTL.AUTH_CODE_MINUTES,
        year: YEAR,
      },
    })

    await this.cache.set(CACHE_KEY, CODE, 1000 * 60 * CACHE_TTL.AUTH_CODE_MINUTES)
    return data
  }

  async login({ email, password, code }: AuthLoginDto) {
    const CACHE_KEY = CACHE_KEYS.auth.code(AuthCodeScene.LOGIN, email)
    const cachedCode = await this.cache.get<string>(CACHE_KEY)
    if (!cachedCode || cachedCode !== code) throw new BadRequestException("Invalid or expired code")

    const _user = await this.userRepo.findByEmail(email)
    if (!_user) throw new BadRequestException("Invalid email or password")
    if (!(await bcrypt.compare(password, _user.password))) throw new BadRequestException("Invalid email or password")

    await this.cache.delete(CACHE_KEY)
    return plainToInstance(UserEntity, _user)
  }
}
