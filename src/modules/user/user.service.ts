import { InjectQueue } from "@nestjs/bullmq"
import { BadRequestException, ConflictException, Injectable } from "@nestjs/common"
import bcrypt from "bcrypt"
import { Queue } from "bullmq"
import { plainToInstance } from "class-transformer"
import { randomUUID } from "crypto"
import { extname } from "path"

import { OSS_KEYS } from "@/common/constants/oss-keys.constants"
import { QUEUE_PROCESSORS } from "@/common/constants/queue-processors.constants"
import { CACHE_KEYS } from "@/common/constants/redis-keys.constants"
import { CacheService } from "@/core/cache/cache.service"
import { AuthCodeScene } from "@/modules/auth/dto/code.dto"
import { FileService } from "@/modules/file/file.service"
import { AdminUpdateUserDto } from "@/modules/user/dto/admin-update-user.dto"
import { CreateUserDto } from "@/modules/user/dto/create-user.dto"
import { ResetUserPasswordDto } from "@/modules/user/dto/reset-user-password.dto"
import { UpdateUserEmailDto } from "@/modules/user/dto/update-user-email.dto"
import { UpdateUserPasswordDto } from "@/modules/user/dto/update-user-password.dto"
import { UpdateUserDto } from "@/modules/user/dto/update-user.dto"
import { UserPageQueryDto } from "@/modules/user/dto/user-list.dto"
import { UserEntity } from "@/modules/user/entities/user.entity"
import { UserRepository } from "@/modules/user/user.repository"

@Injectable()
export class UserService {
  constructor(
    private readonly cache: CacheService,
    private readonly fileService: FileService,
    private readonly userRepo: UserRepository,
    @InjectQueue("image") private readonly imageQueue: Queue,
  ) {}

  async getUser(userId: string) {
    const user = await this.userRepo.findByUserId(BigInt(userId))
    return plainToInstance(UserEntity, user)
  }

  async createUser(dto: CreateUserDto) {
    const exists = await this.userRepo.findByEmail(dto.email)
    if (exists) throw new ConflictException("Email already registered")

    const user = await this.userRepo.create(dto)
    return plainToInstance(UserEntity, user)
  }

  async updateUser(userId: string, dto: UpdateUserDto | AdminUpdateUserDto) {
    const user = await this.userRepo.update(BigInt(userId), dto)
    return plainToInstance(UserEntity, user)
  }

  async updatePassword(userId: string, { oldPassword, newPassword }: UpdateUserPasswordDto) {
    let user = await this.userRepo.findByUserId(BigInt(userId))
    if (!(await bcrypt.compare(oldPassword, user!.password))) throw new ConflictException("Old password is incorrect")

    user = await this.userRepo.updatePassword(BigInt(userId), newPassword)
    return plainToInstance(UserEntity, user)
  }

  async resetPassword({ email, code, newPassword }: ResetUserPasswordDto) {
    const CACHE_KEY = CACHE_KEYS.auth.code(AuthCodeScene.RESET_PASSWORD, email)
    const cachedCode = await this.cache.get<string>(CACHE_KEY)
    if (!cachedCode || cachedCode !== code) throw new BadRequestException("Invalid or expired code")

    const user = await this.userRepo.updatePasswordByEmail(email, newPassword)
    await this.cache.delete(CACHE_KEY)
    return plainToInstance(UserEntity, user)
  }

  async updateEmail(userId: string, { newEmail, code }: UpdateUserEmailDto) {
    const cacheKey = CACHE_KEYS.auth.code(AuthCodeScene.UPDATE_EMAIL, newEmail)

    const cachedCode = await this.cache.get<string>(cacheKey)
    if (!cachedCode || cachedCode !== code) {
      throw new BadRequestException("Invalid or expired code")
    }

    const updatedUser = await this.userRepo.updateEmail(BigInt(userId), newEmail)
    await this.cache.delete(cacheKey)
    return plainToInstance(UserEntity, updatedUser)
  }

  async deleteAvatarFiles(avatar?: string) {
    if (!avatar) return

    await Promise.allSettled([
      this.fileService.deleteFile(avatar),
      this.fileService.deleteFile(`${avatar.split("@raw")[0]}.png`),
    ])
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepo.findByUserId(BigInt(userId))
    const filename = randomUUID()
    const filepath = OSS_KEYS.avatar.user(userId, `${filename}@raw${extname(file.originalname)}`)

    await this.fileService.uploadFile(file, filepath)
    if (user?.avatar) await this.deleteAvatarFiles(user.avatar)

    await this.imageQueue.add(
      QUEUE_PROCESSORS["AVATAR_RESIZE"],
      { filepath },
      { attempts: 3, backoff: 3000, removeOnComplete: true, removeOnFail: false },
    )

    const { avatar } = await this.userRepo.updateAvatar(BigInt(userId), filepath)
    return this.fileService.getFileUrl(`${avatar!.split("@raw")[0]}.png`)
  }

  async removeUser(userId: string) {
    const user = await this.userRepo.remove(BigInt(userId))
    return plainToInstance(UserEntity, user)
  }

  async getUserList(dto: UserPageQueryDto) {
    const [list, total] = await this.userRepo.findMany(dto)
    return {
      list: plainToInstance(UserEntity, list),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      totalPages: Math.ceil(total / dto.pageSize),
    }
  }
}
